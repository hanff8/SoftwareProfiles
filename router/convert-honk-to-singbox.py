#!/usr/bin/env python3
"""Convert the honk config's policy groups and routing rules into a sing-box config.

sing-box has no dynamic name filters, so honk's region groups are rebuilt as
urltest outbounds from the node tags in the base config (same idea as the
updater).  The generic/app groups become selectors.  Rules are translated
one-for-one; geosite categories map to local sing-geosite .srs files.

Usage: python -I convert-honk-to-singbox.py <honk.dae> <base-config.json> <out.json>
"""
import json
import re
import sys

honk_path, base_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]

# ---------------------------------------------------------------- honk parse
def strip_comment(line):
    # honk comments start with #; no regex in this config contains one.
    return line.split("#", 1)[0].rstrip()


def block_lines(lines, start_re):
    """Return (header_index, body_lines) for a top-level `name {` block."""
    for i, raw in enumerate(lines):
        # Top-level blocks start at column 0; the DNS block also contains an
        # indented `routing {` that must not be mistaken for the global one.
        if re.match(start_re, raw):
            depth = 0
            body = []
            for j in range(i, len(lines)):
                line = strip_comment(lines[j])
                if "{" in line:
                    depth += line.count("{")
                if "}" in line:
                    depth -= line.count("}")
                if j > i:
                    body.append(line)
                if depth == 0 and j > i:
                    return body
    raise SystemExit(f"block not found: {start_re}")


honk_lines = open(honk_path, encoding="utf-8").read().splitlines()
group_body = block_lines(honk_lines, r"^group\s*\{")
routing_body = block_lines(honk_lines, r"^routing\s*\{")

groups = {}
cur = None
for line in group_body:
    m = re.match(r"^\s{4}([A-Za-z][A-Za-z0-9_]*)\s*\{\s*$", line)
    if m:
        cur = m.group(1)
        groups[cur] = {"filters": [], "policy": None, "default": None}
        continue
    if cur is None:
        continue
    s = line.strip()
    if s.startswith("filter:"):
        groups[cur]["filters"].append(s[len("filter:"):].strip())
    elif s.startswith("policy:"):
        groups[cur]["policy"] = s[len("policy:"):].strip()
    elif s.startswith("default:"):
        groups[cur]["default"] = s[len("default:"):].strip().strip("'")

# ---------------------------------------------------------------- base config
cfg = json.load(open(base_path, encoding="utf-8"))
outbounds = cfg["outbounds"]

GROUP_TYPES = {"selector", "urltest", "direct", "block", "dns"}
nodes = [o["tag"] for o in outbounds if o.get("type") not in GROUP_TYPES]

JUNK = r"剩余|套餐|到期|重置|官网|机场|流量|订阅"
REGION_PATTERNS = {
    "JP": r"🇯🇵|日本|东京|東京|大阪|Japan|Tokyo|Osaka",
    "KR": r"🇰🇷|韩国|韓國|南韩|南韓|首尔|首爾|Korea|Seoul",
    "TW": r"🇹🇼|台湾|台灣|台北|臺北|高雄|Taiwan|Taipei",
    "SG": r"🇸🇬|新加坡|狮城|獅城|Singapore",
    "UK": r"🇬🇧|英国|英國|伦敦|倫敦|United Kingdom|London",
    "Turkey": r"🇹🇷|土耳其|Turkey|Istanbul|Ankara",
    "HK": r"🇭🇰|香港|Hong Kong",
    "US": r"🇺🇸|美国|美國|纽约|紐約|洛杉矶|洛杉磯|西雅图|西雅圖|圣何塞|聖何塞|United States|America|Los Angeles|Seattle|San Jose",
    "Mainland": r"🇨🇳|中国|中國|大陆|大陸|内地|內地|China|广州|廣州|杭州|上海|北京|深圳|南京|武汉|武漢|成都|重庆|重慶",
}
REGION_ORDER = ["JP", "KR", "TW", "SG", "UK", "Turkey", "HK", "US", "Mainland"]


def matches(tag, pattern):
    return re.search(pattern, tag, re.I) is not None and re.search(JUNK, tag) is None


region_members = {}
for name in REGION_ORDER:
    if name not in groups:
        continue
    members = [t for t in nodes if matches(t, REGION_PATTERNS[name])]
    if members:
        region_members[name] = members

# ---------------------------------------------------------------- outbounds
def urltest(tag, members):
    return {"type": "urltest", "tag": tag, "outbounds": members,
            "interval": "10m", "tolerance": 50, "idle_timeout": "30m"}


def selector(tag, members, default=None):
    o = {"type": "selector", "tag": tag, "outbounds": members}
    if default:
        o["default"] = default
    return o


# Keep the provider's own outbounds/groups; they are refreshed by the updater.
new_outbounds = list(outbounds)

for name in REGION_ORDER:
    if name in region_members:
        new_outbounds.append(urltest(name, region_members[name]))

region_tags = [n for n in REGION_ORDER if n in region_members]

# Auto = all non-mainland nodes; Manual = all usable nodes.
auto_members = [t for t in nodes
                if not re.search(REGION_PATTERNS["Mainland"], t, re.I)
                and not re.search(JUNK, t)]
manual_members = [t for t in nodes if not re.search(JUNK, t)]
new_outbounds.append(urltest("Auto", auto_members or manual_members))
new_outbounds.append(selector("Manual", manual_members or auto_members))
new_outbounds.append(selector("Region", region_tags or ["Auto"],
                              region_tags[0] if region_tags else "Auto"))
new_outbounds.append(selector("Connect", ["Region", "Manual", "Auto", "DIRECT"], "Auto"))
new_outbounds.append(selector("Final", ["Connect", "DIRECT"], "Connect"))

APP_GROUPS = ["OpenAI", "Telegram", "Steam", "TikTok", "Microsoft",
              "Youtube", "Google", "Pikpak", "Porn", "Spotify"]
app_members = ["Connect"] + region_tags
for name in APP_GROUPS:
    if name in groups:
        new_outbounds.append(selector(name, app_members, "Connect"))

# ---------------------------------------------------------------- route rules
def parse_match(expr):
    expr = expr.strip()
    m = re.fullmatch(r"domain\(full:\s*(.+)\)", expr)
    if m:
        return {"domain": [m.group(1).strip()]}
    m = re.fullmatch(r"domain\(suffix:\s*(.+)\)", expr)
    if m:
        return {"domain_suffix": [m.group(1).strip()]}
    m = re.fullmatch(r"domain\(keyword:\s*(.+)\)", expr)
    if m:
        return {"domain_keyword": [m.group(1).strip()]}
    m = re.fullmatch(r"domain\(geosite:\s*(.+)\)", expr)
    if m:
        cat = m.group(1).strip()
        tag = "geosite-cn" if cat == "geolocation-cn" else f"geosite-{cat}"
        return {"rule_set": [tag]}
    m = re.fullmatch(r"pname\((.+)\)", expr)
    if m:
        return {"process_name": [m.group(1).strip()]}
    m = re.fullmatch(r"dip\(geoip:\s*cn\)", expr)
    if m:
        return {"rule_set": ["geoip-cn"]}
    m = re.fullmatch(r"dip\(geoip:\s*private\)", expr)
    if m:
        return {"ip_is_private": True}
    return None


honk_rules = []
final_tag = "Final"
for raw in routing_body:
    line = raw.strip()
    if not line:
        continue
    m = re.match(r"^fallback:\s*(\w+)$", line)
    if m:
        final_tag = m.group(1)
        continue
    m = re.match(r"^(.+?)\s*->\s*(\w+)$", line)
    if not m:
        continue
    match = parse_match(m.group(1))
    target = m.group(2)
    if match is None:
        print(f"skip unmapped rule: {line}", file=sys.stderr)
        continue
    if target == "direct":
        match["outbound"] = "DIRECT"
    elif target == "block":
        match["action"] = "reject"
    else:
        match["outbound"] = target
    honk_rules.append(match)

base_rules = cfg["route"]["rules"]
if not base_rules or base_rules[0].get("action") != "sniff":
    raise SystemExit("base config does not start with a sniff rule; refusing to guess")
# Keep sniff / hijack-dns / private / clash-mode / local rules, then honk's
# rules, then the provider rules as a fallback.
PREFIX = 6
cfg["route"]["rules"] = base_rules[:PREFIX] + honk_rules + base_rules[PREFIX:]
cfg["route"]["final"] = final_tag
cfg["outbounds"] = new_outbounds

# ---------------------------------------------------------------- rule sets
used = set()
for r in cfg["route"]["rules"]:
    used.update(r.get("rule_set", []))
existing = {r["tag"] for r in cfg["route"].get("rule_set", [])}
for tag in sorted(used - existing):
    cfg["route"].setdefault("rule_set", []).append({
        "tag": tag, "type": "local", "format": "binary",
        "path": f"/etc/sing-box/rules/{tag}.srs",
    })

# ---------------------------------------------------------------- DNS
dns_rules = cfg["dns"]["rules"]
dns_extra = [
    {"domain": ["localhost.ptlogin2.qq.com", "localhost.sec.qq.com",
                "localhost.work.weixin.qq.com"], "server": "cn"},
    {"domain_suffix": ["msftconnecttest.com", "msftncsi.com"], "server": "cn"},
]
for r in dns_extra:
    if r not in dns_rules:
        dns_rules.append(r)

json.dump(cfg, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print(f"wrote {out_path}: {len(new_outbounds)} outbounds "
      f"(+{len(new_outbounds) - len(outbounds)} honk groups), "
      f"{len(cfg['route']['rules'])} route rules "
      f"(+{len(honk_rules)} honk rules), final={final_tag}")
print("region groups:", ", ".join(f"{k}={len(v)}" for k, v in region_members.items()))
