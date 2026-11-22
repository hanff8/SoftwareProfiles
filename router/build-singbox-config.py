#!/usr/bin/env python3
"""Convert the provider's sing-box subscription JSON into the WR30U TPROXY config.

Usage: python build-singbox-config.py <provider.json> <out.json> [secret]
"""
import json
import secrets
import sys

src, dst = sys.argv[1], sys.argv[2]
secret = sys.argv[3] if len(sys.argv) > 3 else secrets.token_urlsafe(12)
cfg = json.load(open(src, encoding="utf-8"))

# --- logging ---
cfg["log"] = {"level": "warn", "timestamp": True}

# --- TPROXY inbound (LAN forwarded traffic is redirected here by nftables) ---
cfg["inbounds"] = [
    {"type": "tproxy", "tag": "tproxy-in", "listen": "::", "listen_port": 7895},
    {"type": "mixed", "tag": "mixed-in", "listen": "127.0.0.1", "listen_port": 7891},
]

# --- DNS: no fake-IP; CN via domestic DNS, everything else via proxy ---
cfg["dns"] = {
    "servers": [
        {"type": "udp", "tag": "cn", "server": "223.5.5.5"},
        {"type": "https", "tag": "cn-doh", "server": "223.5.5.5"},
        {"type": "https", "tag": "remote", "server": "1.1.1.1", "detour": "🚀节点选择"},
    ],
    "rules": [
        {"domain_suffix": ["lan", "local", "arpa"], "server": "cn"},
        {"domain_suffix": ["cn"], "server": "cn"},
        {"rule_set": ["geosite-cn"], "server": "cn"},
    ],
    "final": "remote",
    "strategy": "ipv4_only",
}

# --- outbounds: keep provider nodes/groups, set sane selector defaults ---
defaults = {
    "🚀节点选择": "♻️自动选择",
    "🐟漏网之鱼": "🚀节点选择",
    "🎬媒体解锁": "🚀节点选择",
    "🤖AI网站": "🚀节点选择",
    "🛑广告拦截": "REJECT",
}
for ob in cfg["outbounds"]:
    if ob.get("type") == "urltest":
        ob["interval"] = "10m"
        ob["tolerance"] = 50
        ob["idle_timeout"] = "30m"
    if ob.get("type") == "selector" and ob.get("tag") in defaults:
        ob["default"] = defaults[ob["tag"]]

# --- routing: drop QUIC REJECT and forced resolve; add CN direct rules ---
rules = [r for i, r in enumerate(cfg["route"]["rules"]) if i not in (8, 17)]
rules += [
    {"rule_set": ["geosite-cn"], "outbound": "DIRECT"},
    {"rule_set": ["geoip-cn"], "outbound": "DIRECT"},
    {"ip_cidr": ["100.64.0.0/10"], "outbound": "DIRECT"},
]
cfg["route"]["rules"] = rules
cfg["route"]["final"] = "🐟漏网之鱼"
cfg["route"]["auto_detect_interface"] = True
cfg["route"]["default_domain_resolver"] = {"server": "cn"}
cfg["route"]["rule_set"] = [
    {"tag": "geosite-cn", "type": "local", "format": "binary",
     "path": "/etc/sing-box/rules/geosite-cn.srs"},
    {"tag": "geoip-cn", "type": "local", "format": "binary",
     "path": "/etc/sing-box/rules/geoip-cn.srs"},
]

# --- API / cache ---
cfg["experimental"] = {
    "cache_file": {"enabled": True, "path": "/etc/sing-box/cache.db"},
    "clash_api": {
        "external_controller": "0.0.0.0:9090",
        "external_ui": "/etc/sing-box/ui",
        "secret": secret,
        "default_mode": "规则",
        "access_control_allow_origin": "*",
    },
}

json.dump(cfg, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"wrote {dst}: {len(cfg['outbounds'])} outbounds, {len(rules)} route rules, "
      f"secret length {len(secret)}")
