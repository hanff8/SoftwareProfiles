#!/usr/bin/env python3
"""Build the WR30U TPROXY config from the Sub-Store sing-box template.

The Sub-Store template is written for a desktop TUN client and uses `{tag}`
placeholders for remote rule sets.  This script keeps its policy groups and
routing rules, but:
  - keeps the router's tproxy/mixed inbounds and Clash API,
  - expands the remote rule sets into local .srs files,
  - keeps fakeip (LAN DNS is hijacked to sing-box) but drops TUN,
  - fills the region urltests from the node tags in the base config,
  - defaults Manual to United States instead of Direct so unmatched traffic
    is still proxied.

Usage: python -X utf8 build-substore-config.py <template.json> <base-config.json> <out.json>
"""
import copy
import json
import re
import sys

template_path, base_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]

template = json.load(open(template_path, encoding="utf-8"))
base = json.load(open(base_path, encoding="utf-8"))

GROUP_TYPES = {"selector", "urltest", "direct", "block", "dns"}
JUNK = r"剩余|套餐|到期|重置|官网|机场|流量|订阅"

node_outbounds = [o for o in base["outbounds"]
                  if o.get("type") not in GROUP_TYPES
                  and not re.search(JUNK, o["tag"])]
nodes = [o["tag"] for o in node_outbounds]
REGIONS = {
    "HongKong": r"🇭🇰|香港|Hong Kong|(?:^|[^A-Za-z])HK(?:$|[^A-Za-z])",
    "United States": r"🇺🇸|美国|美國|纽约|紐約|洛杉矶|洛杉磯|西雅图|西雅圖|圣何塞|聖何塞|United States|America|Los Angeles|Seattle|San Jose",
    "Singapore": r"🇸🇬|新加坡|狮城|獅城|Singapore",
    "Japan": r"🇯🇵|日本|东京|東京|大阪|Japan|Tokyo|Osaka",
    "Taiwan": r"🇹🇼|台湾|台灣|台北|臺北|高雄|Taiwan|Taipei",
}
REGION_ORDER = ["HongKong", "United States", "Singapore", "Japan", "Taiwan"]

# Zhipu ZCode: z.ai covers zcode.z.ai / cdn-zcode.z.ai / api.z.ai / chat.z.ai;
# bigmodel.cn covers open.bigmodel.cn (GLM Coding Plan API).
ZCODE_DOMAINS = ["z.ai", "bigmodel.cn", "zhipuai.cn", "chatglm.cn"]


def matches(tag, pattern):
    return re.search(pattern, tag, re.I) is not None and re.search(JUNK, tag) is None


region_members = {name: [t for t in nodes if matches(t, REGIONS[name])]
                  for name in REGION_ORDER}


def urltest(tag, members):
    return {"type": "urltest", "tag": tag, "outbounds": members,
            "interval": "10m", "tolerance": 50, "idle_timeout": "30m",
            "interrupt_exist_connections": True}


def selector(tag, members, default):
    return {"type": "selector", "tag": tag, "outbounds": members,
            "default": default, "interrupt_exist_connections": True}


# ---------------------------------------------------------------- outbounds
outbounds = [{"tag": "Direct", "type": "direct"}] + node_outbounds

# Policy groups copied from the template, in template order.
for o in template["outbounds"]:
    if o.get("type") == "direct" or o["tag"] in REGIONS:
        continue
    o = copy.deepcopy(o)
    o["interrupt_exist_connections"] = True
    if o["tag"] == "Manual":
        # Template default is Direct; a router should stay proxied until the
        # user picks a region in the panel.
        o["default"] = "United States"
    if o["tag"] == "AI":
        # The US San Jose node intermittently resets ChatGPT's HTTP/2
        # connections; Singapore is stable.  The panel can still switch it.
        o["default"] = "Singapore"
    if o["tag"] in ("Manual", "Final"):
        # Make the auto/failover groups reachable from the main selectors:
        # picking Manual -> Auto sends that whole class of traffic through
        # the fastest node; Fallback defaults to Auto and can be pinned to
        # Direct when the proxy stack is unusable.
        o["outbounds"] = ["Auto", "Fallback"] + [
            t for t in o["outbounds"] if t not in ("Auto", "Fallback")]
    outbounds.append(o)

# Dedicated group for Zhipu's ZCode.  Default Manual keeps the current
# Singapore behavior; the panel can switch it to Direct or a specific region.
outbounds.append(selector("ZCode",
                          ["Manual", "Direct", "HongKong", "United States",
                           "Singapore", "Japan", "Taiwan"],
                          "Manual"))

# Dedicated group for WorkBuddy AI (magpie's upstream gateway).  Only the
# .ai domain is grouped; workbuddy.cn is CN-hosted and stays on the
# ChinaIP -> Direct path.
outbounds.append(selector("WorkBuddy",
                          ["Manual", "Direct", "HongKong", "United States",
                           "Singapore", "Japan", "Taiwan"],
                          "Manual"))

# Dedicated TikTok group: the template bundles TikTok with Twitter/Facebook
# in Social, but TikTok is region-sensitive.  The panel can pick a region
# independently; default Manual keeps the current Singapore behavior.
outbounds.append(selector("TikTok",
                          ["Manual", "HongKong", "United States",
                           "Singapore", "Japan", "Taiwan"],
                          "Manual"))

# "Auto" is a urltest over every subscription node, so the panel can hand a
# traffic class to whichever node currently responds fastest.  sing-box has
# no native `fallback` group type (1.14 rejects it), so "Fallback" is a
# selector: it defaults to Auto and can be pinned to Direct as a safety net.
outbounds.append(urltest("Auto", nodes))
outbounds.append(selector("Fallback", ["Auto", "Direct"], "Auto"))

# Region urltests.  Every referenced tag must exist, so empty regions fall
# back to a selector; HongKong falls back to the other regions.
for name in REGION_ORDER:
    members = region_members[name]
    if members:
        outbounds.append(urltest(name, members))
    elif name == "HongKong":
        outbounds.append(selector("HongKong",
                                  ["United States", "Singapore", "Japan",
                                   "Taiwan", "Direct"],
                                  "United States"))
    else:
        outbounds.append(selector(name, ["Direct"], "Direct"))

# ---------------------------------------------------------------- rule sets
rule_tags = []
for rs in template["route"]["rule_set"]:
    tags = rs["tag"] if isinstance(rs["tag"], list) else [rs["tag"]]
    rule_tags.extend(tags)
rule_tags = list(dict.fromkeys(rule_tags))

rule_sets = [{"tag": t, "type": "local", "format": "binary",
              "path": f"/etc/sing-box/rules/{t}.srs"} for t in rule_tags]

# ---------------------------------------------------------------- route rules
rules = []
for r in template["route"]["rules"]:
    r = copy.deepcopy(r)
    # Route ZCode's own domains through its dedicated group before the
    # generic AI/Proxy rules (z.ai would otherwise match Proxy).
    if r.get("rule_set") == ["Reject"]:
        rules.append(r)
        # This router has no global IPv6: reject anything that still reaches
        # sing-box over IPv6 instead of letting it fall through to `final`.
        rules.append({"ip_version": 6, "action": "reject"})
        rules.append({"domain_suffix": ZCODE_DOMAINS,
                      "action": "route", "outbound": "ZCode"})
        # WorkBuddy AI gateway (magpie's upstream): falls to `final` otherwise.
        rules.append({"domain_suffix": ["workbuddy.ai"],
                      "action": "route", "outbound": "WorkBuddy"})
        rules.append({"rule_set": ["TikTok"], "action": "route",
                      "outbound": "TikTok"})
        # Wuthering Waves (CN client) SDK/CDN domains.  They are absent from
        # the CN domain list, so they fell through to `final` and were sent to
        # a foreign node; the CN CDN then fails the TLS handshake and the game
        # reports a network error on first launch.  Direct is the correct path.
        rules.append({"domain_suffix": ["kurogame.com", "kurogames.com",
                                        "aki-game.com", "aki-game2.com",
                                        "kurobbs.com"],
                      "action": "route", "outbound": "Direct"})
        continue
    # QUIC is disabled: reject UDP/443 before any policy rule (but after the
    # private-network Direct rule), so every external client falls back to
    # HTTP/2 over TCP, which proxies reliably.  Clients do this within a few
    # hundred milliseconds; nothing else on the router uses UDP/443.
    if r.get("ip_is_private"):
        rules.append(r)
        rules.append({"network": "udp", "port": 443, "action": "reject"})
        continue
    # TikTok now has its own group; Social keeps Twitter/Facebook only.
    if r.get("rule_set") == ["Twitter", "Facebook", "TikTok"]:
        r["rule_set"] = ["Twitter", "Facebook"]
    # Clash API mode names: keep the template's English modes and add the
    # Chinese names used by the current panel.
    if r.get("clash_mode") == "Direct":
        rules.append(r)
        rules.append({"clash_mode": "关闭代理", "action": "route",
                      "outbound": "Direct"})
        continue
    if r.get("clash_mode") == "Global":
        rules.append(r)
        rules.append({"clash_mode": "全局代理", "action": "route",
                      "outbound": "Manual"})
        continue
    # Split ChinaDomain/ChinaIP around resolve so CN domains are matched
    # without first resolving them through domestic DNS.
    if r.get("rule_set") == ["ChinaDomain", "ChinaIP"]:
        rules.append({"rule_set": ["ChinaDomain"], "action": "route",
                      "outbound": "Direct"})
        rules.append({"action": "resolve"})
        rules.append({"rule_set": ["ChinaIP"], "action": "route",
                      "outbound": "Direct"})
        continue
    rules.append(r)

# ---------------------------------------------------------------- DNS
# Keep the template's fakeip.  Domestic UDP and DoH answers are poisoned, so
# LAN DNS (port 53) is TPROXY'd to sing-box; A/AAAA queries get a
# 198.18.0.0/15 fake address and the fakeip store restores the domain before
# routing, letting the proxy node resolve it remotely.
dns = copy.deepcopy(template["dns"])
for server in dns["servers"]:
    if server.get("type") == "fakeip":
        # TPROXY is IPv4-only on this router: never hand out fake IPv6.
        server.pop("inet6_range", None)

# Reorder the mode rules so Direct mode really uses local DNS (the template
# puts the fakeip A/AAAA rule before its Direct rule, which would make Direct
# mode connect to fake addresses).
plain_rules = [r for r in dns["rules"]
               if r.get("server") != "fakeip"
               and r.get("clash_mode") not in ("Direct", "Global")]
direct_rule = next(r for r in dns["rules"]
                   if r.get("clash_mode") == "Direct")
global_rule = next(r for r in dns["rules"]
                   if r.get("clash_mode") == "Global")
fakeip_rule = next(r for r in dns["rules"]
                   if r.get("server") == "fakeip"
                   and r.get("query_type"))
# IPv6 is disabled on this router: answer every AAAA query with an empty
# NOERROR so clients never get an IPv6 address, and keep fakeip for A only.
fakeip_rule["query_type"] = ["A"]
aaaa_rule = {"query_type": ["AAAA"], "action": "predefined",
             "rcode": "NOERROR", "answer": []}
# plain_rules is [Reject, HTTPS, local suffixes, evaluate, evaluate,
# respond, respond]; insert the mode rules after the local suffix rule.
dns["rules"] = ([aaaa_rule] + plain_rules[:3] + [
    direct_rule,
    {"clash_mode": "关闭代理", "action": "route", "server": "local"},
    global_rule,
    {"clash_mode": "全局代理", "action": "route", "server": "fakeip"},
    fakeip_rule,
] + plain_rules[3:])
dns["final"] = "ali-doh"

experimental = copy.deepcopy(base.get("experimental", {}))
if "cache_file" in experimental:
    # Persist the fakeip mapping so connections survive a restart.
    experimental["cache_file"]["store_fakeip"] = True

# Services (sing-box >= 1.14): the `api` service serves the official
# sing-box dashboard at /dashboard/ and the gRPC-Web API it uses.
# Carried over from the base config so the secret stays out of this repo.
services = copy.deepcopy(base.get("services", []))

# ---------------------------------------------------------------- assemble
# The TPROXY rules are IPv4-only; don't listen on the IPv6 wildcard.
inbounds = copy.deepcopy(base["inbounds"])
for inbound in inbounds:
    if inbound.get("type") == "tproxy" and inbound.get("listen") == "::":
        inbound["listen"] = "0.0.0.0"

cfg = {
    "log": base.get("log", {"level": "warn", "timestamp": True}),
    "dns": dns,
    "inbounds": inbounds,
    "outbounds": outbounds,
    "route": {
        "rule_set": rule_sets,
        "rules": rules,
        "auto_detect_interface": True,
        "default_domain_resolver": {"server": "ali-udp"},
        "final": "Final",
    },
    "experimental": experimental,
    "services": services,
}

json.dump(cfg, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print(f"wrote {out_path}: {len(outbounds)} outbounds, {len(rules)} rules, "
      f"{len(rule_sets)} rule sets")
print("regions:", ", ".join(f"{k}={len(v)}" for k, v in region_members.items()))
print("rule sets:", ", ".join(rule_tags))
