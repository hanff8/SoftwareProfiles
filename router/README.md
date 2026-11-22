# WR30U 路由器调试笔记

小米 WR30U（ubootmod），ImmortalWrt 25.12.2，`mediatek/filogic`，aarch64，内核 6.12.103，**仅 232 MB 内存**。管理地址 `192.168.31.1`。

本目录保存本次会话的成果：

- `honk-config.dae` —— 历史 honk 配置（2026-11-08 已迁移到 sing-box TPROXY，保留作回滚参考；订阅链接已隐去，部署前替换为自己的订阅）。公开版本在仓库根目录。
- `sing-box/` —— sing-box TPROXY 的 nft 规则、init、订阅更新、看门狗、一键启停脚本。面板/API 密钥与节点凭据不随仓库发布。
- `build-singbox-config.py` —— 把订阅返回的 sing-box JSON 改造成 TPROXY 配置。
- `build-substore-config.py` —— 按 `substore/sing-box/1.14/sing-box.json` 模板生成当前配置。
- `convert-honk-to-singbox.py` —— 历史：把 `honk-config.dae` 的策略组与规则转换成 sing-box（已被 Sub-Store 配置取代）。
- `backup/` —— 迁移前 honk 的完整回滚备份（gitignored）。
- 本文 —— 调试经验与运维手册。

> 公开版：节点凭据、面板/API 密钥、订阅链接与 Tailscale 地址已移除或隐去；`sing-box-config*.json`、`subscription.url`、`*-secret.txt` 不在仓库中。

> 记录时间：2026-10-31 ~ 11-08。2026-11-08 已从 honk 迁移到 sing-box TPROXY；§1–§5 的 honk 内容保留作历史与回滚参考，日常运维看 §6。

---

## 1. 升级固件

- 正确镜像必须带 `ubootmod`：`immortalwrt-<ver>-mediatek-filogic-xiaomi_mi-router-wr30u-ubootmod-squashfs-sysupgrade.itb`（不是 stock 版）。
- 25.12+ 改用 **apk**，不是 opkg；第三方包（tailscale、openclash 等）不会跨版本保留，必须重装。UCI 配置 `/etc/config` 会保留。
- `fit` UBI 卷是固定大小的，新版镜像变大后，前台 `ssh ... sysupgrade` 会在 sshd 被杀时一起死掉，路由器静默留在旧版本（不重启、uptime 继续累加）。必须**脱离终端**执行：

  ```sh
  setsid sh -c 'sysupgrade -v /tmp/fw.itb > /tmp/su.log 2>&1; echo EXIT=$? >> /tmp/su.log' < /dev/null > /dev/null 2>&1 &
  ```

  再看 `/tmp/su.log`。`nand_upgrade_fit` 会自己扩容。
- 升级前备份：`ssh root@... 'sysupgrade -b -' > backup.tar.gz`。
- 验证：`cat /etc/openwrt_release`、`uptime` 应约 0 分钟、`ip -4 addr show br-lan` = 192.168.31.1。

## 2. 装包

ImmortalWrt 25.12 用 apk，镜像 `mirrors.vsean.net`（kmods hash 要对）。

**tailscale**：`apk add tailscale luci-app-tailscale-community`。节点名 `immortalwrt`，`<tailscale-ip>`，状态在 `/etc/tailscale/tailscaled.state`，配置 `/etc/config/tailscale`（fw_mode nftables，v1.98.3）。

**honk** 必须从官方 daeuniverse OpenWrt 源装，裸二进制没有 LuCI 菜单：

```sh
wget -O /etc/apk/keys/daeuniverse.pem https://openwrt.daeuniverse.org/public-key.pem
# /etc/apk/repositories.d/daeuniverse.list（ImmortalWrt 只写 packages 行，不要 kmods）
# @daeuniverse https://openwrt.daeuniverse.org/25.12/packages/aarch64_cortex-a53/packages.adb
apk add honk@daeuniverse luci-app-honk@daeuniverse luci-i18n-daeuniverse-zh-cn@daeuniverse
```

服务 `/etc/init.d/honk`，UCI `/etc/config/honk`（`honk.config.enabled=1`），配置 `/etc/honk/config.dae`，LuCI 菜单 `Services → honk`。

## 3. 232MB 内存：反复 OOM 是这台机器的核心问题

### 现象

honk 每隔几天就挂。日志里配置**明明加载成功**，然后在 eBPF 加载完成后立刻被内核杀死：

```
INFO  honk_core: Loaded 62 nodes, 24 groups, 31 routing rules
INFO  ... Loading eBPF programs (3217248 bytes)
INFO  ... Attached 6 required cgroup programs to /sys/fs/cgroup
kern.err Out of memory: Killed process NNNN (honk-core) total-vm:60900kB, anon-rss:0kB
daemon.info procd: Instance honk::honk in a crash loop 6 crashes
procd 连续重启 6 次全部 OOM 后就彻底放弃了，服务一直是 not running。
```

### 根因

BPF verifier（`bpf_check` / `allocate_slab`）需要较大的**连续物理内存**。这台机器只有 232MB，运行几天后 `/proc/buddyinfo` 里没有高阶连续块，即使空闲几十 MB，也会因为分配失败触发**全局 OOM**（global_oom，不只是 honk，tailscaled 也常被一起杀）。所以「内存看起来够」没用，是碎片问题。

典型内存构成（honk 起来后）：`MemAvailable` 只剩 8~30MB；honk cgroup 约 33~59MB，其中 `kernel`（eBPF map）约 29MB、`anon` 约 18MB、进程 VmRSS 约 25MB；`SUnreclaim` slab 约 44MB。

### 手动恢复流程（重要）

普通 `restart` 必然 crash loop。正确顺序是「先停 tailscale 腾内存 → 清理残留 → 单次启动 honk → 再拉 tailscale」：

```sh
/etc/init.d/honk stop 2>&1
/etc/init.d/tailscale stop 2>&1          # tailscaled 占 ~30MB，先停显著提升成功率
sleep 3
for p in $(pidof honk-core); do kill -9 "$p"; done
ip link del dae0 2>/dev/null             # 残留的 netkit 网卡
ip link del dae0peer 2>/dev/null
rm -f /run/honk-core.lock
sync
echo 1 > /proc/sys/vm/compact_memory     # 关键：整理连续内存
echo 3 > /proc/sys/vm/drop_caches
/etc/init.d/honk start
sleep 20; pidof honk-core                # 确认 eBPF 加载完成且进程存活
/etc/init.d/tailscale start
```

**绝不**同时跑两个 honk 实例。第一次启动仍可能 OOM，procd 自动重试的第二次通常能活。

如果反复 OOM 都救不回来，**直接重启路由器**最可靠（重启后内存连续，honk 一次就起得来）。

### 已落地的加固（2026-11-04 / 11-07）

1. **启动脚本整理内存**：`/etc/init.d/honk` 的 `procd_open_instance` 之前插入（备份 `/root/honk-init.bak`）：

   ```sh
   sync
   echo 1 > /proc/sys/vm/compact_memory 2>/dev/null
   echo 3 > /proc/sys/vm/drop_caches 2>/dev/null
   ```

   同时把官方默认的 `nofile="1048576 1048576"` 改成 `nofile="8192 8192"`（honk 按 RLIMIT_NOFILE 给流表定尺寸，太大吃内存）。**`apk upgrade honk` 会覆盖这个脚本，升级后要重新加。**

2. **换 stock 版二进制**：官方是 mimalloc 版，已换成 release 的 `-stock` 版（v0.1.0-beta.4 aarch64 musl stock-full，sha256 `9b2e30d6…`）以降低 RSS。升级后同样要重新替换。

3. **zram 调大**：`/etc/config/system` 的 `zram_size_mb='512'`（uci 设置），swap 约 512MB。`/tmp` 是 tmpfs，放大会吃内存。

4. **提高换页倾向**：`/etc/sysctl.conf` 加 `vm.swappiness=100`（运行时 `echo 100 > /proc/sys/vm/swappiness`）。

5. **每天凌晨 4 点重启**：`/etc/crontabs/root`：

   ```
   0 4 * * * /sbin/reboot
   ```

   时区 `CST-8`，即本地 04:00。注意原来 **cron 服务根本没在跑**（`active with no instances`），必须 `/etc/init.d/cron enable && /etc/init.d/cron start`（现在有 `S50cron`）。honk(S99) / tailscale(S80) 会开机自启。重启约断网 1~2 分钟。

6. **自动恢复看门狗**：`/usr/bin/honk-watchdog`（脚本见下），cron 每 5 分钟一次：

   ```
   */5 * * * * /usr/bin/honk-watchdog
   ```

   逻辑：`pidof honk-core` 为空才动作；停 tailscale → 按上面流程清理+整理+启动 → 等 20 秒没活就再试一次 → 恢复 tailscale。这样即使 procd 放弃，5 分钟内也会自动拉起。

   ```sh
   #!/bin/sh
   TAG=honk-watchdog
   [ -n "$(pidof honk-core)" ] && exit 0
   logger -t "$TAG" "honk-core is down; starting recovery"
   TS_WAS_UP=0
   [ -n "$(pidof tailscaled)" ] && { TS_WAS_UP=1; /etc/init.d/tailscale stop >/dev/null 2>&1; }
   recover() {
       /etc/init.d/honk stop >/dev/null 2>&1; sleep 2
       for p in $(pidof honk-core); do kill -9 "$p" 2>/dev/null; done
       ip link del dae0 2>/dev/null; ip link del dae0peer 2>/dev/null
       rm -f /run/honk-core.lock; sync
       echo 1 > /proc/sys/vm/compact_memory 2>/dev/null
       echo 3 > /proc/sys/vm/drop_caches 2>/dev/null
       /etc/init.d/honk start >/dev/null 2>&1
   }
   recover; sleep 20
   [ -z "$(pidof honk-core)" ] && { recover; sleep 25; }
   [ "$TS_WAS_UP" = 1 ] && /etc/init.d/tailscale start >/dev/null 2>&1
   logger -t "$TAG" "recovery finished: honk=$(pidof honk-core) tail=$(pidof tailscaled)"
   ```

### 官方默认配置为什么也会 OOM

`experimental` 块（doona native UI / Clash API / cache_file）和 `dns { upstream local: 127.0.0.1:53 }` 都会导致失败（后者还会和 dnsmasq 抢 53 造成解析环）。最小可用直连配置：

```
global { wan_interface auto; lan_interface br-lan; data_dir "/etc/honk/data"; dial_mode domain; auto_config_kernel_parameter true }
routing { fallback: direct }
```

不要 `dns`、不要 `experimental`。最小配置约 32MB cgroup，完整配置（订阅+24 组+31 geosite 规则）约 45~59MB。

### 内核限制

内核缺 ftrace/raw-tracepoint UDP 回退（`bpf_raw_tracepoint_open` 报 ENOTSUPP / os error 524）。`nfqueue_enable: true` 是 QUIC/UDP 的回退路径，配置里已开。

## 4. honk 配置要点（config.dae）

完整文件见同目录 `honk-config.dae`。踩过的坑：

- **订阅 UA**：该站按 UA 返回不同格式。`ua: 'clash.meta'` 返回 513KB Clash YAML，路由器拉取经常超时；`ua: 'honk/1.0'` 返回 33KB base64 分享链接列表（约 3 秒）。`store_subscribe` 默认 true，会把上次有效内容持久化到 `<data_dir>/state/honk.db`，启动时 `restored=true` 可从缓存恢复（Cloudflare 限流时很有用）。
- **订阅链接含访问令牌**，公开版本已隐去为 `https://example.invalid/api/v1/pq/REDACTED`。
- **组按声明顺序解析**：被引用的组必须先声明。顺序是：9 个国家组(JP/KR/TW/SG/UK/Turkey/HK/US/Mainland, urltest) → Auto / Manual / Region → Connect → Final → 10 个应用组。
- **`filter: group('A','B',...)` 多参数不是并集**（Region 曾解析成 0 个节点）。要写成多行 `filter: group('X')`，多个 `filter:` 行之间是 OR。
- **`default:` 只是首次默认值**：面板/CLI 选过的成员会写进 `state/honk.db` 的 `selector(grp, network, member)` 表并**覆盖 `default:`**。之前「默认出口走直连」就是 Connect 被持久化成了 `direct`。清掉的办法：临时把 `name('direct')` 从该组 filter 里去掉并 reload，让持久化选择失效，`default: 'Auto'` 才生效。恢复 filter 前记得先查 DB。
- **`honk-core proxy <GROUP> <NODE>` 只接受配置文件里的具体节点**，不接受订阅节点名和嵌套组名（会报 `Node 'Auto' not found in configuration`）。订阅节点的选择要走面板/API。
- **DNS**：`dial_mode: domain++` 时被代理域名由节点远端解析，本地污染结果不影响代理连接。上游 `domestic: https://dns.alidns.com/dns-query -> direct`、`default: udp://223.5.5.5:53 -> direct`，`ipversion_prefer: 4`。**DNS/接口改动需要重启，reload(SIGHUP) 不生效**。
- **国内纯 IP 应用必须有 `dip(geoip: cn) -> direct`**：QQ/微信/游戏直连腾讯裸 IP（如 `43.137.247.77:443`），没有域名可嗅探，缺这条会落到 `fallback: Final` 走国外节点，QQ 报「连接已断开」。要放在所有 `domain()` 规则**之后**，并在前面给 google/youtube/telegram/openai 等常见被墙服务显式 geosite 规则，否则国内 DNS 污染出的 CN IP 会误判直连。当前 31 条路由。
- **不要用 `dip(geoip: cn) -> direct` 之外的 IP 直连兜底**：早期加过，被墙域名的污染 IP 恰好是 CN 段时会绕过代理；已靠 geosite 规则修正。
- **ping 不通是正常的**：eBPF 只接管 TCP/UDP，ICMP 不代理（国内直连 ping google 必失败）。判断用 curl/浏览器。路由器自己的 `uclient-fetch` 也不可靠（honk 不稳定代理本机输出），**要从 LAN 客户端验证**。
- **doona 面板**：`experimental.native_api` 监听 `0.0.0.0:9527`，`password_auth: true`，`config_write: true`，`ui: 'embedded-lite'`（`embedded` 全量版在这台 232MB 上可能 OOM）。地址 `http://192.168.31.1:9527/`（307 → `/ui/`），仅 LAN 可访（WAN zone REJECT）。首次访问创建管理员。localhost 上的 API 会被 honk 自身 eBPF 拦(EPERM)，要从 LAN 访问。

## 5. 排障速查

| 现象 | 先查 |
|---|---|
| honk `not running` | `logread \| grep -iE "oom\|killed\|crash loop"`；手动恢复流程见 §3 |
| 国外网站打不开 | 查 Connect 是否被持久化成 `direct`（`state/honk.db` 的 selector 表）；LAN 客户端 curl 验证出口 IP |
| QQ 掉线 | 是否有 `dip(geoip: cn) -> direct` 且在 domain 规则之后 |
| ping 不通但 curl 通 | 正常，ICMP 不代理 |
| 路由器本机 curl 失败但 PC 正常 | 正常，用 LAN 客户端测 |
| 订阅拉不下来 | UA 是否 `honk/1.0`；`state/honk.db` 是否有缓存（`restored=true`） |
| 面板打不开 | `experimental.native_api` 是否开启；从 LAN 而非 localhost 访问 |
| cron 没执行 | `/etc/init.d/cron status` + `pidof crond`；默认可能是 `active with no instances`，要 enable+start |

**验证基线**（LAN 客户端，默认路由指向 192.168.31.1、本机无 TUN/系统代理）：
`google/generate_204` = 204，`youtube/wikipedia/telegram` = 200，`baidu` = 200，出口 IP 为国外节点（如 67.159.48.x / 52.197.137.x）。

**注意本机干扰**：排查时 PC 上若还开着 FlClash / sing-box，`tun0`(sing-tun) 会把默认路由指向 `172.18.0.2`、DNS 返回 `198.18.x.x` fake-IP，导致本机网站全打不开，看起来像路由器挂了。这些是 Windows 服务（`sing-box-daemon`、`sing-box-daemon-reF1nd`、FlClashHelperService，自动启动），要用管理员权限停掉/禁用，光 kill 进程会被服务自动拉起。**2026-11-08 起路由器本身也使用 `198.18.0.0/15` fakeip**：判断时看 `nslookup www.google.com 192.168.31.1` 是否返回 `198.18.x.x`（路由器正常），并确认本机没有 TUN 适配器、默认路由没有被改。两者不要同时开，fake IP 段会冲突。

---

## 6. 迁移到 sing-box TPROXY（2026-11-08）

honk 的 eBPF 在这台 232MB 机器上反复 OOM（见 §3），已整体替换为 **sing-box 1.14.4 + nftables TPROXY**（1.14.4 为官方 GitHub 静态 musl 二进制，替换 OpenWrt feed 自带的 1.12.25）。honk 包已卸载，保留 §3 的恢复流程作为回滚参考。

### 为什么可行

- sing-box 是普通 Go 进程，实测 RSS 约 17–37MB，不再需要大块连续物理内存，避免了 eBPF verifier 的 global OOM。
- 订阅站对 UA `sing-box` 直接返回完整 sing-box JSON（76 个出站：46 vless / 16 hysteria2 / 3 shadowsocks，含 5 个 selector、4 个 urltest），无需自己转换分享链接。
- 内核需 `kmod-nft-tproxy`（已装），nftables 1.1.6 自带 tproxy 支持。

### 安装与 UCI

```sh
apk add sing-box kmod-nft-tproxy jq
```

包自带 `/etc/init.d/sing-box`（START=99，默认 `enabled=0`）：

```sh
uci set sing-box.main.enabled=1
uci set sing-box.main.user=root
uci set sing-box.main.conffile=/etc/sing-box/config.json
uci set sing-box.main.workdir=/etc/sing-box
uci commit sing-box
```

### 升级到 1.14.4（官方二进制）

- 从 `SagerNet/sing-box` GitHub release 下载 `sing-box-1.14.4-linux-arm64-musl`。校验：86,155,608 B、aarch64 静态、`sing-box version` = 1.14.4（Go 1.26.10，tags 含 `with_quic`/`with_clash_api`/`with_musl`）。
- 先备份旧版到 PC（`backup/sing-box-1.12.25`），再用 `sing-box check -c /etc/sing-box/config.json` 确认新二进制能读当前配置，最后替换 `/usr/bin/sing-box`（755）并启动服务。
- overlay 很小：86MB 二进制在 UBIFS 上约 37MB，替换后剩余约 12MB。
- 1.14 配置迁移要点：
  - DNS 服务器改成新格式：`{"type":"udp","tag":"cn","server":"223.5.5.5"}`、`{"type":"https","tag":"remote","server":"1.1.1.1","detour":"🚀节点选择"}`；旧格式（`{"tag":...,"address":...}`）会被拒绝。
  - 直连 DNS 服务器**不要写 `detour`**：新格式默认就是空直连 dialer，写 `detour: "DIRECT"` 会 FATAL `detour to an empty direct outbound makes no sense`。只有 `remote` 保留 `detour`。
  - `independent_cache` 已移除；`store_rdrc` 改名为 `store_dns`。
- 验证：`sing-box version`、面板 delay 测试、Clash API `connections` 里的真实 LAN 代理链，以及重启后 TPROXY 是否自动恢复。

### 文件

- `/etc/sing-box/config.json` —— 主配置（含节点凭据与面板 secret，**不要外传**）。
- `/etc/sing-box/rules/{geosite-cn,geoip-cn}.srs` —— 本地 rule-set（sing-geosite/sing-geoip 的 `rule-set` 分支，各 34–57KB）。
- `/etc/sing-box/dashboard/` —— 官方 sing-box dashboard 静态文件（`SagerNet/sing-box-dashboard` 的 `gh-pages`，约 8MB；旧 metacubexd `ui/` 已删除）。
- `/etc/sing-box/tproxy.nft` + `/etc/init.d/sing-box-tproxy` —— TPROXY nft 规则与策略路由。
- `/usr/bin/sing-box-update` + `/etc/sing-box/subscription.url`（600）—— 订阅更新。
- `/usr/bin/sing-box-watchdog` —— 每 5 分钟 cron 兜底。

### TPROXY 原理

- nftables `inet sing_box` 表在 `prerouting`（priority mangle）把 LAN 的 TCP/UDP 重定向到 `:7895`，并打 `mark 1`。
- `ip rule add fwmark 1 lookup 100` + `ip route add local 0.0.0.0/0 dev lo table 100` 把标记包送到本地 tproxy socket。
- 排除：`iifname lo/tailscale0`、`fib daddr type local`（路由器自身地址：LuCI/SSH/面板）、私网/CGNAT/组播/广播。**53 端口的 DNS 在 `fib daddr type local return` 之前单独 tproxy 到 sing-box**，用于 fakeip。
- ICMP 不接管（与 honk 一样，`ping` 失败是正常的，用 curl/浏览器验证）。
- 只接管 IPv4：这台机器 WAN 没有全局 IPv6（只有 br-lan ULA），没有做 v6 tproxy；tproxy 入站 `listen` 显式改成 `0.0.0.0`，不再监听 `::`。IPv6 在 DNS 和路由两层同时封死，见下文“IPv6 屏蔽”。
- 非 procd init 脚本**不要写 `USE_PROCD=0`**：rc.common 用 `[ -n "$USE_PROCD" ]` 判断，`0` 也是非空，会进入 procd 分支并覆盖 `start()`，表现为 `start` 返回 0 但 nft 表没加载。直接省略该变量。

### 路由与 DNS

- 入口：`tproxy`（7895）+ `mixed`（127.0.0.1:7891，调试用）。
- DNS：采用 Sub-Store 模板的 AliDNS/腾讯 DoH 竞速。`hosts_fix` 预置 `dns.alidns.com`/`doh.pub` 的 IP；`ali-doh`/`ali-udp` + `tx-doh`/`tx-udp` 通过 `evaluate`/`respond` 竞速，本地域名走 `local`；`final: ali-doh`，`strategy: ipv4_only`，`default_domain_resolver: ali-udp`。
- **fakeip（2026-11-08 修复）**：国内 UDP 和 DoH 的 A 记录都被污染（实测 google→31.13.92.37/157.240.7.20、gstatic→202.101.48.34/98、chatgpt→108.160.163.116），代理出站拿到污染 IP 会 TLS 失败。因此恢复模板的 fakeip：LAN 的 53 端口 DNS 被 TPROXY 劫持到 sing-box，A 记录返回 `198.18.0.0/15` 假 IP；连接到达时 sing-box 从 fakeip store 还原域名（`route/route.go` 的 `prepareMatchMetadata`），代理节点远端解析。`cache_file.store_fakeip: true` 持久化映射；只配 `inet4_range`（TPROXY 仅 IPv4），Direct 模式规则排在 fakeip 规则之前。dnsmasq 仍负责 DHCP，`.lan`/`.local` 由 `local` server 兜底。fakeip 规则现只匹配 `query_type: ["A"]`，AAAA 交给 IPv6 屏蔽规则。
- **IPv6 屏蔽（2026-11-14）**：这台路由器没有全局 IPv6，但 LAN 客户端仍可能拿到 AAAA 或直接发 IPv6 包。现在两层封死：
  - DNS：DNS 规则**第一条**是 `{"query_type":["AAAA"],"action":"predefined","rcode":"NOERROR","answer":[]}`，所有 AAAA 查询都回空 NOERROR（不是 NXDOMAIN/REFUSED），客户端立即放弃 IPv6、回落到 A，不会卡在超时上。它排在 `Reject`/`local`/fakeip 等所有规则之前，因此 `.lan`、`Direct` 模式、Clash 各模式下的 AAAA 也一并被压掉。
  - 路由：`Reject` 规则之后紧跟 `{"ip_version":6,"action":"reject"}`，任何仍以 IPv6 到达 sing-box 的连接直接拒绝，不会落到 `final`→Manual 被发往代理节点。
  - 入站：tproxy 的 `listen` 从 `::` 改为 `0.0.0.0`（`build-substore-config.py` 自动处理），避免在 IPv6 通配符上多开一个没人用的监听。
  - 实测：LAN 上 `nslookup -type=AAAA www.google.com 192.168.31.1` 与 `ipv6.google.com` 均返回 “No IPv6 address (AAAA) records”；`www.baidu.com` 的 A 仍返回 fakeip `198.18.0.8`，HTTPS 200。
- **QUIC 屏蔽（2026-11-14）**：在私网直连规则之后、Clash 模式规则之前加 `{"network":"udp","port":443,"action":"reject"}`。位置很关键——放在 Clash 模式规则之前，Direct/Global/关闭代理/全局代理各模式都会生效；放在私网规则之后，LAN 内部的 QUIC（如 NAS 的 h3）不受影响。客户端（Chrome/YouTube/Google）会在几百毫秒内回落到 HTTP/2 over TCP，代理链路更稳定。DNS（53）规则在它之前，不受影响；sing-box 自身出站（hysteria2 等）也不经过路由规则。实测：Chrome 打开 google.com.hk 和 youtube.com，页面内 `nextHopProtocol` 与 `nhp` 全部是 `h2`（此前 Google/YouTube 会走 h3）；DNS 与普通 HTTPS 访问正常（baidu 200、youtube 200）。
  - 注意：`sing-box-update` 只替换 `.outbounds`，这条规则在订阅更新后仍保留；`build-substore-config.py` 已同步生成。
- 路由：sniff → hijack-dns → 私网直连 → QUIC reject → Clash 模式 → `Reject` → IPv6 reject → `ZCode` → `WorkBuddy` → `TikTok` → 鸣潮域名直连 → AI/Telegram/Social/Game/Google/Microsoft/Emby/Spotify/Streaming → `Proxy`→Manual → `AppleProxy`→HongKong → `ChinaDomain`→Direct → resolve → `ChinaIP`→Direct；`final: Final`。
- 策略组：Manual/AI/Google/Microsoft/Social/Telegram/Game/Emby/Spotify/Streaming/Final/ZCode/WorkBuddy/TikTok/Auto/Fallback；地区 urltest HongKong/United States/Singapore/Japan/Taiwan。订阅没有香港节点，`HongKong` 退化为 selector [US/SG/JP/TW/Direct] 默认 US；其余地区为空时退化为 Direct。模板的 `Manual` 默认是 Direct，这里改成 **United States**，避免未选节点时全部直连；`AI` 默认改成 **Singapore**（美国圣何塞节点对 ChatGPT 的 HTTP/2 连接偶发重置，面板仍可切换）。
- **ZCode 策略组（2026-11-08）**：智谱 ZCode 的 `z.ai`（含 `zcode.z.ai`/`cdn-zcode.z.ai`/`api.z.ai`/`chat.z.ai`）、`bigmodel.cn`（含 `open.bigmodel.cn`）、`zhipuai.cn`、`chatglm.cn` 单独走 `ZCode` selector，成员 Manual/Direct/HK/US/SG/JP/TW，默认 **Manual**（跟随当前 Singapore）。路由规则放在 `Reject` 之后、`AI` 之前，避免被 `Proxy` 规则抢先。实测 Direct 和 Manual 都可用；面板可单独切换 ZCode，不影响其他流量。
- **TikTok 策略组（2026-11-08）**：从 `Social` 拆出，`TikTok.srs` 单独走 `TikTok` selector，成员 Manual/HK/US/SG/JP/TW，默认 **Manual**（跟随当前 Singapore）；`Social` 只保留 Twitter/Facebook。面板可单独切 TikTok 地区（US/JP/SG 等）测试不同区内容，不影响其他社交应用。
- **WorkBuddy 策略组（2026-11-14）**：magpie 的上游 AI 网关 `workbuddy.ai`（API 与站点）之前不在任何规则集里，落到 `final`→Manual。现加 `domain_suffix: workbuddy.ai` → `WorkBuddy` selector（Manual/Direct/HK/US/SG/JP/TW，默认 **Manual**），放在 `ZCode` 之后、`TikTok` 之前。`workbuddy.cn` 是国内托管，保持 `ChinaIP`→Direct 不动。实测 `https://www.workbuddy.ai/` 200，Clash API 显示链路 `domain_suffix=workbuddy.ai => route(WorkBuddy)`。
- **Auto / Fallback 分组（2026-11-14）**：`Auto` 是覆盖全部订阅节点（62 个）的 `urltest`，自动选当前最快的节点；`Fallback` 默认指向 `Auto`，可手动切到 `Direct` 兜底。**sing-box 没有原生 `fallback` 出站类型**（1.14 实测报 `unknown outbound type: fallback`），所以 Fallback 实际是 selector，不是 Clash 那种“按顺序取第一个可用”。两者都加进了 `Manual` 和 `Final` 的成员，面板里把 Manual/Final 切到 Auto 即可让整类流量自动选节点；实测 Manual→Auto 后 `https://www.youtube.com/` 200，成功后已切回 United States。`Auto` 的 `idle_timeout: 30m` 在无人使用时会停止测速，避免 62 个节点额外探测拖累 232MB 机器（重启后 RSS 约 58MB，之前约 52MB）。
- **鸣潮直连（2026-11-09）**：`kurogame.com`、`kurogames.com`、`aki-game.com`、`aki-game2.com`、`kurobbs.com` 不在 CN 域名表里，之前落到 `final` 被代理到日本节点；国内 CDN `pro-cdn-sdk.kurogame.com`（解析到 111.208.127.15 移动 CDN）经代理时 TLS 握手直接失败，鸣潮首次启动报“网络异常”，重试或切直连才恢复。现加 `domain_suffix` → `Direct` 规则，放在 `Reject`/`ZCode`/`TikTok` 之后、`AI` 之前。实测同一域名：直连 TLS 正常（根路径 403），代理时 0.28s SSL 失败；`aki-config-*.aki-game2.com` 里走代理的两个也失败、走 Direct 的 qcloud 正常，故一并加入。Kuro BBS 的 `web-static.kurobbs.com`（同为 Kunlun CDN，111.208.127.x）也是同样问题，2026-11-10 补入。
- urltest：`interval=10m, tolerance=50, idle_timeout=30m`，降低 232MB 机器的探测开销。

### 按 Sub-Store 模板重构策略组与规则（2026-11-08）

以 `substore/sing-box/1.14/sing-box.json` 为模板重写了策略组和路由规则；之前的 honk 转换配置备份为 `/etc/sing-box/config.json.bak-substore-20261108`，`convert-honk-to-singbox.py` 仅作参考。

- 模板是桌面 TUN 配置；路由器上保留 `tproxy`/`mixed` 入站、Clash API、真实 DNS 和 fakeip，去掉 TUN。
- 模板里的 `{tag}` 远程 rule-set 已展开为 22 个本地文件（来自 Repcz/Tool，共约 258KB）：`Reject`、`AI`、`Telegram`、`Twitter`、`Facebook`、`TikTok`、`Steam`、`Epic`、`Google`、`Microsoft`、`Github`、`Emby`、`Spotify`、`Bahamut`、`Netflix`、`Disney`、`PrimeVideo`、`HBO`、`Proxy`、`AppleProxy`、`ChinaDomain`、`ChinaIP`，放在 `/etc/sing-box/rules/`。
- 生成脚本 `build-substore-config.py` 读取模板、当前配置和节点列表，填充地区组、展开 rule-set、保留路由器入站/面板和 fakeip。
- 订阅更新脚本按模板重建：用 `grep` 从新节点名提取 HK/US/SG/JP/TW 生成 urltest，组为空时回退 Direct；不依赖 jq 正则（路由器 jq 1.8 没编译 Oniguruma）。
- 实测：Telegram → `🇸🇬AWS新加坡05 > Singapore > Telegram`；`chatgpt.com` → `United States > AI`；Microsoft/Github → `United States > Microsoft`；AppleProxy → `United States > HongKong`；国内域名走 `ChinaDomain`/`ChinaIP` 直连；各组延迟约 170–400ms。

### 面板

- **官方 dashboard（2026-11-08 起）**：sing-box 1.14 的 `services` 里新增 `type: "api"` 服务，监听 `0.0.0.0:9091`，地址 `http://192.168.31.1:9091/dashboard/`。它用 gRPC-Web 直连 sing-box 原生 API（状态/连接/策略组/日志/Clash 模式），不再依赖 Clash API 兼容层。
  - 配置：`services: [{type:"api", listen:"0.0.0.0", listen_port:9091, secret:"…", dashboard:{enabled:true, path:"/etc/sing-box/dashboard"}}]`；`secret` 本地副本 `sing-box/api-secret.txt`（gitignored）。
  - 静态文件是手动放入的（目录里有文件但没有 `.etag`），sing-box 判定为 user-provided，**不会自动下载/更新**，也不会被 GitHub 不可达影响。
  - 首次打开在面板里添加服务器：URL 填 `192.168.31.1:9091`，secret 填上面的值（浏览器 localStorage 保存）。
  - 可用 `sing-box api` 子命令自测：`BOX_API_URL=http://127.0.0.1:9091 BOX_API_SECRET=… sing-box api status`。
- Clash API 保留：`0.0.0.0:9090`（`external_ui` 已移除），仍供脚本/第三方工具使用；secret 见 `experimental.clash_api.secret`，本地副本 `sing-box/panel-secret.txt`（gitignored）。
- 仅 LAN 可访问（WAN zone REJECT）。

### 订阅更新

- `/usr/bin/sing-box-update` 用 `wget -4`（**必须 -4**：这台机器没有全局 IPv6，busybox wget 默认走 v6 会报 `SSL error`），UA `sing-box` 拉取约 312KB JSON；先用 `jq -e '.outbounds | type == "array" and length > 0'` 校验订阅结构，`jq` 只替换 `.outbounds`、保留本地 DNS/入口/路由；只对**合并后**的配置跑 `sing-box check`（订阅原始 JSON 仍是旧版 DNS 格式，1.14 直接 check 会失败），通过后重启。
- 订阅站对同一令牌短时间重复请求会限流（表现为 `download failed`），等 30 秒再试即可。
- cron：`0 5 * * * /usr/bin/sing-box-update`（每天 5 点，4 点重启之后）。

### 看门狗与定时任务

- `/usr/bin/sing-box-watchdog` 每 5 分钟：sing-box 不在就 restart；重启失败就停 TPROXY 恢复直连；sing-box 在但 TPROXY 表丢了就补上。
- 每天 4 点重启保留，用于清理内存碎片/缓存。
- cron 当前内容：

  ```
  0 4 * * * /sbin/reboot
  */5 * * * * /usr/bin/sing-box-watchdog
  0 5 * * * /usr/bin/sing-box-update
  ```

### 一键启停

- `/usr/bin/sing-box-ctl`（仓库副本 `sing-box/sing-box-ctl.sh`）：
  - `sing-box-ctl` 不带参数 = 在运行/停止之间切换（一键）；`on` / `off` 显式启停；`status` 查看状态。
  - `off` 的顺序很关键：先注释掉 watchdog 和订阅更新的 cron（否则 5 分钟内会被看门狗拉起），再停 TPROXY（清 nft 表和 `fwmark 1` 策略路由）、停 sing-box，最后 `disable` 两者的开机自启——这样每天 4 点的重启也不会把代理带回来。
  - `on` 反向恢复：`enable` 开机自启、取消注释 cron、启动 sing-box、等 `:7895` 监听后再加载 TPROXY（避免规则先于监听导致 LAN 黑洞）。
  - `status` 输出 sing-box pid、TPROXY 状态、开机自启、cron 是否暂停、监听端口。实测 `off` 后 LAN 直连正常（baidu 200），`toggle` 两次可正常回到运行态（google/youtube 200）。
  - 热切换注意：selector 的选择会被 `cache.db` 的 `store_selected` 持久化，重启后恢复的是上次面板选择而不是配置里的 default；需要回到默认时在面板/Clash API 重新选一次即可。

### 验证方法

- `sing-box check -c /etc/sing-box/config.json`
- `pidof sing-box`、`nft list table inet sing_box`、`ip rule show | grep fwmark`、`ip route show table 100`
- Clash API：`curl -H "Authorization: Bearer <secret>" http://192.168.31.1:9090/proxies`
- 隔离测试：`ip netns` + veth 挂到 br-lan，模拟 LAN 客户端。注意 `uclient-fetch`/busybox `wget` 在 netns 里可能报 `Operation not permitted`（工具与同机 tproxy 的交互问题），但 Clash API 的 `connections` 能看到 `tproxy/tproxy-in` 和代理链；真实 LAN 客户端不受影响。
- 实测（1.14.4）：Clash API `connections` 显示 `chatgpt.com` 链为 `United States > AI`，`wetype.weixin.qq.com` 走 `ChinaDomain => Direct`，`courier.push.apple.com` 走 `AppleProxy => HongKong`；各组延迟约 170–400ms；重启后 `sing-box version` = 1.14.4、TPROXY 自动恢复。
- fakeip 修复后实测（2026-11-08）：LAN 的 `nslookup www.google.com 192.168.31.1` 返回 `198.18.0.5`；PC 上用 `Invoke-WebRequest`/浏览器：gstatic 204、google 200、youtube 200、chatgpt 200、anthropic 404（连通）、baidu 200；`connections` 显示 `chatgpt.com` → `United States > AI`、`mtalk.google.com` → `United States > Google`、百度 → `ChinaDomain => Direct`。
- IPv6 屏蔽实测（2026-11-14）：`nslookup -type=AAAA www.google.com 192.168.31.1`、`ipv6.google.com` → “No IPv6 address (AAAA) records”；`nslookup -type=A www.baidu.com 192.168.31.1` → `198.18.0.8`；`https://www.baidu.com/` → 200。配置里 `ss -ltn` 显示 `0.0.0.0:7895`，`jq` 可见 AAAA `predefined` 规则和 `ip_version: 6` reject。
- PC 上 `curl.exe` 可能走 WLAN 网卡残留的 ISP DNS 拿到污染 IP（如 google→174.132.167.252），而系统解析器/浏览器正常；测试时优先用 `Invoke-WebRequest`，或 `curl --resolve 域名:443:<fakeip>` 强制走 fake IP。

### 回滚到 honk

- 备份：`backup/honk-core`（30MB stock 二进制）、`backup/router-config.tgz`（含 config.dae、init、watchdog、cron、sysctl、firewall、dhcp）。
- 重新安装：`apk add honk@daeuniverse luci-app-honk@daeuniverse`，恢复 `/etc/honk/config.dae`，停 `sing-box`/`sing-box-tproxy`，按 §3 启动 honk。
- honk 的 `/etc/honk/data` 已删除（geodata 会重新下载）；`/etc/init.d/honk` 已删除。

### 注意

- `config.json` 含节点 UUID/密码和面板 secret，**不要提交到公开仓库**；`my-router` 仓库无远端，公开版只放脱敏模板。
- `apk upgrade sing-box` 会把 `/usr/bin/sing-box` 换回 feed 版本（1.12.x），也会覆盖 `/etc/init.d/sing-box`；升级后要重新替换官方 1.14.4 二进制。我们的 TPROXY 脚本是独立的，不受影响。
- 本机 FlClash 仍会接管 PC 流量（fake-IP 198.18.x），验证路由器代理时不要用这台 PC 的默认网络，改用手机/其他 LAN 设备或路由器上的 netns 测试。
