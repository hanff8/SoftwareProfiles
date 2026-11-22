# Kuro SignIn for Surge

库街区自动签到 Surge 插件，拆成两个脚本配合：

1. **`kuro-capture.js`** — http-request 脚本，挂在库街区 API 上，从 App 请求头里抓取 token / devCode / distinct_id 等凭证，存进 Surge。
2. **`kuro-signin.js`** — cron 脚本，读取抓到的凭证，定时完成签到。

不用 Python、不用 Docker、不用云服务器，token 也不用再手动填。

功能：鸣潮/战双游戏签到（可选补签）、库街区论坛每日任务（签到/浏览/点赞/分享）、多账号、通知推送、当天状态持久化（重复运行不重复签到）。

## 工作原理

```
库街区 App 发请求 ──(MITM + http-request 脚本)──> kuro-capture.js 抓取凭证 → 存入 Surge
                                                        ↓
每天定时 ──> kuro-signin.js 读取凭证 ──> 签到 API ──> 通知结果
```

抓凭证脚本只是"旁观"App 的流量，原样放行请求，不影响 App 正常使用。

## 安装

把三个文件放进同一目录：

- `kuro-capture.js`
- `kuro-signin.js`
- `kuro-signin.sgmodule`

本目录文件已放在 GitHub：`https://github.com/hanff8/SoftwareProfiles/tree/master/scripts/surge`，模块里的脚本路径用的是 raw 链接，可以直接从仓库安装。

方式 A（推荐，模块）：安装模块 URL `https://raw.githubusercontent.com/hanff8/SoftwareProfiles/master/scripts/surge/kuro-signin.sgmodule`，启用时 `accounts` 参数填 `[{"name":"主号"}]`（名字随便起，两个脚本都认这个值）。模块已包含 MITM 和两行脚本配置。同一个 `accounts` 同时传给两个脚本：抓取脚本取第一个 `name` 作为当前抓的账号，签到脚本会签列表里的所有账号。

方式 B（手动写配置）：

```ini
[MITM]
hostname = api.kurobbs.com

[Script]
kuro.capture = type=http-request,pattern=^https://api\.kurobbs\.com/,script-path=kuro-capture.js,argument=主号
kuro.signin = type=cron,cronexp="0 8 * * *",script-path=kuro-signin.js,timeout=120,argument=[{"name":"主号"}]
```

`cronexp="0 8 * * *"` 表示每天 08:00 执行。Surge 也支持在 UI 里手动运行 cron 脚本来测试。

## 使用步骤

1. 开启 MITM，并安装 Surge 描述文件（macOS 还需要在系统里信任 Surge 证书）。
2. 打开库街区 App，随便点几个页面（尤其是签到/个人中心），让 App 发出带凭证的 API 请求。
3. 收到"库街区凭证已抓取"通知后，说明凭证已存好。
4. 运行 `kuro.signin` 脚本测试签到；确认没问题后就让它每天定时跑。

> token 会过期。过期后重新打开 App 触发一次抓取即可，无需改任何配置。

## 账号参数（argument）

两个脚本的 `argument` 用同一个"别名"对应账号：

- 抓凭证脚本：`argument=主号`（一个脚本实例对应一个账号；多账号就写多行，每行一个别名）
- 签到脚本：`argument` 留空 → 自动签到所有抓到的账号；或者写 JSON 数组来精细控制

签到脚本的 JSON 配置项：

| 字段 | 说明 |
| --- | --- |
| `name` | 账号别名，必须和抓凭证脚本的 `argument` 一致 |
| `enable` | 是否启用，默认 `true` |
| `game` | `all`（默认）/ `wuwa` / `pgr` / `none` |
| `forum` | 是否做论坛任务，默认 `true` |
| `autoReplenish` | 是否自动补签，默认 `false` |
| `token` | 可选。手填后优先于抓到的凭证 |
| `games` | 可选，手动指定角色 ID：`{"wuwa":{"roleId":"..."},"pgr":{"roleId":"..."}}` |

几个常见写法：

```ini
# 单账号，全自动（两个脚本都用同一个别名，或都不填）
kuro.capture = type=http-request,pattern=^https://api\.kurobbs\.com/,script-path=kuro-capture.js,argument=主号
kuro.signin = type=cron,cronexp="0 8 * * *",script-path=kuro-signin.js,timeout=120

# 多账号：抓取脚本只写一行，签到脚本不填参数就签所有抓到的账号
kuro.capture = type=http-request,pattern=^https://api\.kurobbs\.com/,script-path=kuro-capture.js,argument=主号
kuro.signin = type=cron,cronexp="0 8 * * *",script-path=kuro-signin.js,timeout=120

# 多账号，但只签主号且关闭论坛任务
kuro.capture = type=http-request,pattern=^https://api\.kurobbs\.com/,script-path=kuro-capture.js,argument=[{"name":"主号"}]
kuro.signin = type=cron,cronexp="0 8 * * *",script-path=kuro-signin.js,timeout=120,argument=[{"name":"主号","forum":false}]
```

抓取脚本的 `argument` 既能写别名（如 `主号`），也能写和签到脚本一样的 JSON 数组（会取其中的 `name`），所以安装模块时把 `accounts` 填成 `[{"name":"主号"}]` 就行，两个脚本都认。

> 注意：Surge 里同一个 pattern 只会执行第一个匹配的 http-request 脚本，所以抓取脚本只写一行。脚本按 token 自动识别账号：同一别名再次抓取会覆盖旧凭证；App 切号后 token 变了，脚本会自动按 token 找到对应账号并更新。想新增账号，在 App 里切到该账号触发一次抓取，然后给抓取脚本换个别名（如 `argument=小号`）再抓一次即可。

## 行为说明

- 抓凭证脚本把数据存在 `$persistentStore` 的 `kuro_capture_store` 键里；签到状态存在 `kuro_signin_state`。两个键互不干扰。
- 签到成功后状态写入持久化存储，同一天再次触发会跳过。想重跑就换个别名，或在 Surge 里清除脚本持久化数据。
- 失败的接口会等 10 秒重试一轮；登录过期、用户信息异常不会重试。
- 通知显示成功/失败/跳过数量和每个账号明细，完整日志在 Surge 脚本日志里。
- 所有签到请求走 `$httpClient`，跟随当前节点策略。如果库街区 API 被节点干扰，可在 `request` 函数里加 `policy: 'DIRECT'`。

## 局限

- 抓凭证依赖 MITM 解密 HTTPS，需要在设备上信任 Surge 证书。
- 依赖库街区 API 的请求头和字段名，官方改接口后需要同步更新脚本。
- 游戏签到需要账号已绑定角色；战双 `serverId` 如果不对，按抓包结果改 `GAMES.pgr.serverId`。
- token 属于敏感信息，存在 Surge 本地持久化存储里，不要导出分享。

仅供学习交流使用。
