#!/bin/sh
# Refresh node outbounds from the subscription, keeping the local TPROXY/DNS/route config.
# Rebuilds the Sub-Store template's policy groups from the new node list.
# Requires: wget (busybox), jq, grep, sing-box.
set -e

TAG=sing-box-update
URL=$(cat /etc/sing-box/subscription.url)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

wget -4 -q -T 30 -O "$TMP/sub.json" --header="User-Agent: sing-box" "$URL" || {
	logger -t "$TAG" "download failed"
	exit 1
}

jq -e '.outbounds | type == "array" and length > 0' "$TMP/sub.json" >/dev/null 2>&1 || {
	logger -t "$TAG" "subscription JSON invalid"
	exit 1
}

# --- rebuild the Sub-Store region groups from the new node tags --------------
NODES=$(jq -r '.outbounds[]
	| select(.type != "selector" and .type != "urltest" and .type != "direct"
	         and .type != "block" and .type != "dns")
	| .tag' "$TMP/sub.json")

JUNK='剩余|套餐|到期|重置|官网|机场|流量|订阅'

json_array() { printf '%s\n' "$1" | jq -R -s 'split("\n") | map(select(length > 0))'; }
region_nodes() { printf '%s\n' "$NODES" | grep -E "$1" | grep -vE "$JUNK" || true; }

HK=$(json_array "$(region_nodes '🇭🇰|香港|Hong Kong')")
US=$(json_array "$(region_nodes '🇺🇸|美国|美國|纽约|紐約|洛杉矶|洛杉磯|西雅图|西雅圖|圣何塞|聖何塞|United States|America|Los Angeles|Seattle|San Jose')")
SG=$(json_array "$(region_nodes '🇸🇬|新加坡|狮城|獅城|Singapore')")
JP=$(json_array "$(region_nodes '🇯🇵|日本|东京|東京|大阪|Japan|Tokyo|Osaka')")
TW=$(json_array "$(region_nodes '🇹🇼|台湾|台灣|台北|臺北|高雄|Taiwan|Taipei')")

jq --slurpfile sub "$TMP/sub.json" \
   --argjson hk "$HK" --argjson us "$US" --argjson sg "$SG" \
   --argjson jp "$JP" --argjson tw "$TW" '
  def url($t; $m): {type:"urltest", tag:$t, outbounds:$m,
                    interval:"10m", tolerance:50, idle_timeout:"30m",
                    interrupt_exist_connections:true};
  def sel($t; $m; $d): {type:"selector", tag:$t, outbounds:$m, default:$d,
                        interrupt_exist_connections:true};
  def region($t; $m): if ($m|length) > 0 then url($t; $m)
                     else sel($t; ["Direct"]; "Direct") end;
  ($sub[0].outbounds
   | map(select(.type != "selector" and .type != "urltest"
                and .type != "direct" and .type != "block" and .type != "dns"))
   | map(select((.tag | contains("剩余") or contains("套餐")
                 or contains("距离下次")) | not))
  ) as $nodes
  | .outbounds = (
      [{tag:"Direct", type:"direct"}]
      + $nodes
      + [
          sel("Manual"; ["Auto","Fallback","HongKong","United States","Singapore","Japan","Taiwan","Direct"]; "United States"),
          sel("AI"; ["Manual","HongKong","United States","Singapore","Japan","Taiwan"]; "Singapore"),
          sel("Google"; ["Manual","HongKong","United States","Singapore","Japan","Taiwan"]; "United States"),
          sel("Microsoft"; ["Manual","HongKong","United States","Singapore","Japan","Taiwan","Direct"]; "United States"),
          sel("Social"; ["Manual","HongKong","United States","Singapore","Japan","Taiwan"]; "Manual"),
          sel("Telegram"; ["Manual","HongKong","United States","Singapore","Japan","Taiwan"]; "Singapore"),
          sel("Game"; ["Manual","HongKong","United States","Singapore","Japan","Taiwan","Direct"]; "Manual"),
          sel("Emby"; ["Manual","HongKong","United States","Singapore","Japan","Taiwan","Direct"]; "Manual"),
          sel("Spotify"; ["Manual","HongKong","United States","Singapore","Japan","Taiwan","Direct"]; "Manual"),
          sel("Streaming"; ["Manual","HongKong","United States","Singapore","Japan","Taiwan"]; "Manual"),
          sel("Final"; ["Auto","Fallback","Manual","HongKong","United States","Singapore","Japan","Taiwan","Direct"]; "Manual"),
          sel("ZCode"; ["Manual","Direct","HongKong","United States","Singapore","Japan","Taiwan"]; "Manual"),
          sel("WorkBuddy"; ["Manual","Direct","HongKong","United States","Singapore","Japan","Taiwan"]; "Manual"),
          sel("TikTok"; ["Manual","HongKong","United States","Singapore","Japan","Taiwan"]; "Manual"),
          url("Auto"; ($nodes | map(.tag))),
          sel("Fallback"; ["Auto","Direct"]; "Auto"),
          (if ($hk|length) > 0 then url("HongKong"; $hk)
           else sel("HongKong"; ["United States","Singapore","Japan","Taiwan","Direct"]; "United States") end),
          region("United States"; $us),
          region("Singapore"; $sg),
          region("Japan"; $jp),
          region("Taiwan"; $tw)
        ]
    )
' /etc/sing-box/config.json > "$TMP/config.json"

sing-box check -c "$TMP/config.json" >/dev/null 2>&1 || {
	logger -t "$TAG" "merged config invalid, keeping old"
	exit 1
}

mv "$TMP/config.json" /etc/sing-box/config.json
/etc/init.d/sing-box restart
logger -t "$TAG" "outbounds refreshed"
