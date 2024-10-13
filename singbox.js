const onGenerate = async (config) => {
    config.route.rules = [
        {
            "type": "logical",
            "mode": "or",
            "rules": [
                {
                    "port": 53
                },
                {
                    "protocol": "dns"
                }
            ],
            "outbound": "dns-out"
        },
        {
            "rule_set": "geosite-category-ads-all",
            "outbound": "AdBlock"
        },
        {
            "clash_mode": "Direct",
            "outbound": "Direct"
        },
        {
            "clash_mode": "global",
            "outbound": "Connect"
        },
        {
            "protocol": "quic",
            "outbound": "block"
        },
        {
            "domain": [
                "clash.razord.top",
                "yacd.metacubex.one",
                "yacd.haishan.me",
                "d.metacubex.one"
            ],
            "domain_suffix": [
                "mypikpak.net",
                "dl.google.com"
            ],
            "domain_keyword": [
                "aki-game",
                "kurogame"
            ],
            "outbound": "Direct"
        },
        {
            "process_name": [
                "Client-Win64-Shipping",
                "TencentMeeting",
                "NemoDesktop",
                "ToDesk",
                "ToDesk_Service",
                "WeChat",
                "Tailscale",
                "wireguard-go",
                "Tunnelblick",
                "softwareupdated",
                "kubectl"
            ],
            "outbound": "Direct"
        },
        {
            "domain_suffix": [
                "apm.yun.hihonor.com"
            ],
            "outbound": "block"
        },
        {
            "inbound": "socks-in",
            "outbound": "Connect"
        },
        {
            "domain_suffix": [
                "googleapis.cn",
                "googleapis.com",
                "xn--ngstr-lra8j.com"
            ],
            "outbound": "Google"
        },
        {
            "rule_set": [
                "geoip-cn",
                "geosite-cn"
            ],
            "outbound": "China"
        },
        {
            "rule_set": "geosite-openai",
            "outbound": "OpenAI"
        },
        {
            "rule_set": [
                "geosite-youtube",
                "geoip-google",
                "geosite-google",
                "geosite-github"
            ],
            "outbound": "Google"
        },
        {
            "rule_set": [
                "geoip-telegram",
                "geosite-telegram"
            ],
            "outbound": "Telegram"
        },
        {
            "rule_set": [
                "geoip-twitter",
                "geosite-twitter"
            ],
            "outbound": "Twitter"
        },
        {
            "rule_set": [
                "geoip-facebook",
                "geosite-facebook"
            ],
            "outbound": "Facebook"
        },
        {
            "rule_set": [
                "geosite-bilibili"
            ],
            "outbound": "BiliBili"
        },
        {
            "rule_set": "geosite-bahamut",
            "outbound": "Bahamut"
        },
        {
            "rule_set": "geosite-spotify",
            "outbound": "Spotify"
        },
        {
            "rule_set": "geosite-tiktok",
            "outbound": "TikTok"
        },
        {
            "rule_set": [
                "geoip-netflix",
                "geosite-netflix"
            ],
            "outbound": "NETFLIX"
        },
        {
            "rule_set": "geosite-disney",
            "outbound": "Disney+"
        },
        {
            "rule_set": [
                "geoip-apple",
                "geosite-apple",
                "geosite-amazon"
            ],
            "outbound": "Apple"
        },
        {
            "rule_set": "geosite-microsoft",
            "outbound": "Microsoft"
        },
        {
            "rule_set": "geosite-category-games",
            "outbound": "Games"
        },
        {
            "rule_set": [
                "geosite-hbo",
                "geosite-primevideo"
            ],
            "outbound": "Streaming"
        },
        {
            "rule_set": [
                "geoip-private",
                "geosite-private"
            ],
            "outbound": "Direct"
        },
        {
            "ip_is_private": true,
            "outbound": "Direct"
        }
    ]
    config.route.rule_set = [
        {
            "tag": "geoip-cn",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geoip/geoip-cn.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geoip-google",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geoip/geoip-google.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geoip-telegram",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geoip/geoip-telegram.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geoip-twitter",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geoip/geoip-twitter.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geoip-facebook",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geoip/geoip-facebook.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geoip-netflix",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geoip/geoip-netflix.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geoip-apple",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-apple.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geoip-private",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geoip/geoip-private.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-private",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-private.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-openai",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-openai.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-youtube",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-youtube.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-google",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-google.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-github",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-github.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-telegram",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-telegram.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-twitter",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-twitter.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-facebook",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-facebook.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-bilibili",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-bilibili.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-bahamut",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-bahamut.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-spotify",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-spotify.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-tiktok",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-tiktok.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-netflix",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-netflix.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-disney",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-disney.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-apple",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-apple.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-amazon",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-amazon.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-microsoft",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-microsoft.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-category-games",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-category-games.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-hbo",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-hbo.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-primevideo",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-primevideo.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-cn",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-cn.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-geolocation-!cn",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-geolocation-!cn.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-geolocation-cn",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-geolocation-cn.srs",
            "download_detour": "Direct"
        },
        {
            "tag": "geosite-category-ads-all",
            "type": "remote",
            "format": "binary",
            "url": "https://testingcf.jsdelivr.net/gh/lyc8503/sing-box-rules@rule-set-geosite/geosite-category-ads-all.srs",
            "download_detour": "Direct"
        }
    ]
    config.outbounds = [
        {
            "tag": "Connect",
            "type": "selector",
            "outbounds": [
                "Region-Selector",
                "Manual-Selector",
                "Auto",
                "Direct"
            ]
        },
        {
            "tag": "Region-Selector",
            "type": "selector",
            "outbounds": [
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others"
            ]
        },
        {
            "tag": "Final",
            "type": "selector",
            "outbounds": [
                "Connect",
                "Direct"
            ]
        },
        {
            "tag": "Manual-Selector",
            "type": "selector",
            "outbounds": [
                "Coo套餐到期：2024-11-23",
                "Coohttps://web.coo.wiki",
                "🇭🇰 Coo香港|HK01",
                "🇭🇰 Coo香港|HK02",
                "🇭🇰 Coo香港|HK03",
                "🇭🇰 Coo香港|HK04",
                "🇭🇰 Coo香港|HK05",
                "🇭🇰 Coo香港|HK06",
                "🇭🇰 Coo香港|HK07",
                "🇭🇰 Coo香港|HK08",
                "🇭🇰 Coo香港|HK09",
                "🇭🇰 Coo香港|HK35",
                "🇹🇼 Coo台湾|TW02",
                "🇯🇵 Coo日本|T01",
                "🇯🇵 Coo日本|T02",
                "🇯🇵 Coo日本|T03",
                "🇯🇵 Coo日本|T04",
                "🇯🇵 Coo日本|T05",
                "🇯🇵 Coo日本|T06",
                "🇯🇵 Coo日本|T09",
                "🇰🇷 Coo韩国|SEL2",
                "🇸🇬 Coo新加坡|SG01",
                "🇸🇬 Coo新加坡|SG02",
                "🇸🇬 Coo新加坡|SG03",
                "🇸🇬 Coo新加坡|SG04",
                "🇸🇬 Coo新加坡|SG05",
                "🇸🇬 Coo新加坡|SG06",
                "🇸🇬 Coo新加坡|SG07",
                "🇸🇬 Coo新加坡|SG08",
                "🇸🇬 Coo新加坡|SG09",
                "🇵🇭 Coo菲律宾|MNL2",
                "🇲🇾 Coo马来西亚|MAS1|x9",
                "🇦🇺 Coo澳大利亚|SYD1",
                "🇺🇸 Coo美国|DA1",
                "🇺🇸 Coo美国|KS1",
                "🇺🇸 Coo美国|NY1",
                "🇺🇸 Coo美国|LA1",
                "🇺🇸 Coo美国|LA2",
                "🇺🇸 Coo美国|PHX1",
                "🇺🇸 Coo美国|SEA1",
                "🇺🇸 Coo美国|SJ0",
                "🇨🇦 Coo加拿大|CA1",
                "🇦🇷 Coo阿根廷|BA1|50M",
                "🇬🇧 Coo英国|COV2",
                "🇩🇪 Coo德国|FRA1",
                "🇫🇷 Coo法国|PAR1",
                "🇮🇹 Coo意大利|MIL1",
                "🇹🇷 Coo土耳其|IST1",
                "1yunti[trojan] 最新网址：1yunti.com",
                "1yunti[trojan] 套餐到期：2025-09-28",
                "🇭🇰 1yunti[trojan] 香港 01",
                "🇭🇰 1yunti[trojan] 香港 02",
                "🇭🇰 1yunti[trojan] 香港 03",
                "🇭🇰 1yunti[trojan] 香港 04",
                "🇭🇰 1yunti[trojan] 香港 05",
                "🇭🇰 1yunti[trojan] 香港 06",
                "🇭🇰 1yunti[trojan] 香港 07",
                "🇭🇰 1yunti[trojan] 香港 08",
                "🇭🇰 1yunti[trojan] 香港 09",
                "🇭🇰 1yunti[trojan] 香港 10",
                "🇭🇰 1yunti[trojan] 香港 11",
                "🇭🇰 1yunti[trojan] 香港 12",
                "🇭🇰 1yunti[trojan] 香港 13",
                "🇭🇰 1yunti[trojan] 香港 14",
                "🇭🇰 1yunti[trojan] 香港 15",
                "🇭🇰 1yunti[trojan] 香港 16",
                "🇭🇰 1yunti[trojan] 香港 17",
                "🇭🇰 1yunti[trojan] 香港 18",
                "🇭🇰 1yunti[trojan] 香港 19",
                "🇭🇰 1yunti[trojan] 香港 20",
                "🇹🇼 1yunti[trojan] 台湾 01",
                "🇹🇼 1yunti[trojan] 台湾 02",
                "🇹🇼 1yunti[trojan] 台湾 03",
                "🇹🇼 1yunti[trojan] 台湾 04",
                "🇹🇼 1yunti[trojan] 台湾 05",
                "🇹🇼 1yunti[trojan] 台湾 06",
                "🇹🇼 1yunti[trojan] 台湾 07",
                "🇹🇼 1yunti[trojan] 台湾 08",
                "🇹🇼 1yunti[trojan] 台湾 09",
                "🇹🇼 1yunti[trojan] 台湾 10",
                "🇸🇬 1yunti[trojan] 新加坡 01",
                "🇸🇬 1yunti[trojan] 新加坡 02",
                "🇸🇬 1yunti[trojan] 新加坡 03",
                "🇸🇬 1yunti[trojan] 新加坡 04",
                "🇸🇬 1yunti[trojan] 新加坡 05",
                "🇸🇬 1yunti[trojan] 新加坡 06",
                "🇸🇬 1yunti[trojan] 新加坡 07",
                "🇸🇬 1yunti[trojan] 新加坡 08",
                "🇸🇬 1yunti[trojan] 新加坡 09",
                "🇸🇬 1yunti[trojan] 新加坡 10",
                "🇯🇵 1yunti[trojan] 日本 01",
                "🇯🇵 1yunti[trojan] 日本 02",
                "🇯🇵 1yunti[trojan] 日本 03",
                "🇯🇵 1yunti[trojan] 日本 04",
                "🇯🇵 1yunti[trojan] 日本 05",
                "🇯🇵 1yunti[trojan] 日本 06",
                "🇯🇵 1yunti[trojan] 日本 07",
                "🇯🇵 1yunti[trojan] 日本 08",
                "🇯🇵 1yunti[trojan] 日本 09",
                "🇯🇵 1yunti[trojan] 日本 10",
                "🇺🇸 1yunti[trojan] 美国 01",
                "🇺🇸 1yunti[trojan] 美国 02",
                "🇺🇸 1yunti[trojan] 美国 03",
                "🇺🇸 1yunti[trojan] 美国 04",
                "🇺🇸 1yunti[trojan] 美国 05",
                "🇺🇸 1yunti[trojan] 美国 06",
                "🇺🇸 1yunti[trojan] 美国 07",
                "🇺🇸 1yunti[trojan] 美国 08",
                "🇺🇸 1yunti[trojan] 美国 09",
                "🇺🇸 1yunti[trojan] 美国 10",
                "🇰🇷 1yunti[trojan] 韩国01",
                "🇰🇷 1yunti[trojan] 韩国02",
                "🇰🇷 1yunti[trojan] 韩国03",
                "🇲🇾 1yunti[trojan] 马来西亚 01",
                "🇲🇾 1yunti[trojan] 马来西亚 02",
                "🇲🇾 1yunti[trojan] 马来西亚 03",
                "🇲🇾 1yunti[trojan] 马来西亚 04",
                "🇲🇾 1yunti[trojan] 马来西亚 05",
                "🇬🇧 1yunti[trojan] 英国 01",
                "🇬🇧 1yunti[trojan] 英国 02",
                "🇬🇧 1yunti[trojan] 英国 03",
                "🇬🇧 1yunti[trojan] 英国 04",
                "🇬🇧 1yunti[trojan] 英国 05",
                "🇹🇭 1yunti[trojan] 泰国 01",
                "🇹🇭 1yunti[trojan] 泰国 02",
                "🇻🇳 1yunti[trojan] 越南 01",
                "🇻🇳 1yunti[trojan] 越南 02",
                "🇵🇭 1yunti[trojan] 菲律宾 01",
                "🇵🇭 1yunti[trojan] 菲律宾 02",
                "🇮🇳 1yunti[trojan] 印度 01",
                "🇹🇷 1yunti[trojan] 土耳其 01",
                "🇹🇷 1yunti[trojan] 土耳其 02",
                "🇦🇷 1yunti[trojan] 阿根廷 01",
                "🇦🇷 1yunti[trojan] 阿根廷 02"
            ]
        },
        {
            "tag": "OpenAI",
            "type": "selector",
            "outbounds": [
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others",
                "Region-Selector",
                "Connect"
            ],
            "default": "America"
        },
        {
            "tag": "Google",
            "type": "selector",
            "outbounds": [
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others",
                "Region-Selector",
                "Connect"
            ]
        },
        {
            "tag": "Telegram",
            "type": "selector",
            "outbounds": [
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others",
                "Region-Selector",
                "Connect"
            ],
            "default": "Connect"
        },
        {
            "tag": "Twitter",
            "type": "selector",
            "outbounds": [
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others",
                "Region-Selector",
                "Connect"
            ],
            "default": "Connect"
        },
        {
            "tag": "Facebook",
            "type": "selector",
            "outbounds": [
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others",
                "Region-Selector",
                "Connect"
            ],
            "default": "Connect"
        },
        {
            "tag": "BiliBili",
            "type": "selector",
            "outbounds": [
                "Direct",
                "HongKong",
                "TaiWan",
                "Region-Selector",
                "Connect"
            ],
            "default": "Direct"
        },
        {
            "tag": "Bahamut",
            "type": "selector",
            "outbounds": [
                "TaiWan",
                "HongKong",
                "Connect",
                "Region-Selector"
            ]
        },
        {
            "tag": "Spotify",
            "type": "selector",
            "outbounds": [
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others",
                "Region-Selector",
                "Connect"
            ],
            "default": "America"
        },
        {
            "tag": "TikTok",
            "type": "selector",
            "outbounds": [
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America"
            ],
            "default": "Japan"
        },
        {
            "tag": "NETFLIX",
            "type": "selector",
            "outbounds": [
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others"
            ]
        },
        {
            "tag": "Disney+",
            "type": "selector",
            "outbounds": [
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others"
            ]
        },
        {
            "tag": "Apple",
            "type": "selector",
            "outbounds": [
                "Direct",
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others"
            ],
            "default": "Direct"
        },
        {
            "tag": "Microsoft",
            "type": "selector",
            "outbounds": [
                "Direct",
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others"
            ],
            "default": "Direct"
        },
        {
            "tag": "Games",
            "type": "selector",
            "outbounds": [
                "Direct",
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others"
            ],
            "default": "Direct"
        },
        {
            "tag": "Streaming",
            "type": "selector",
            "outbounds": [
                "HongKong",
                "TaiWan",
                "Singapore",
                "Japan",
                "America",
                "Others"
            ]
        },
        {
            "tag": "China",
            "type": "selector",
            "outbounds": [
                "Direct",
                "Connect"
            ]
        },
        {
            "tag": "AdBlock",
            "type": "selector",
            "outbounds": [
                "block",
                "Direct"
            ]
        },
        {
            "tag": "HongKong",
            "type": "urltest",
            "outbounds": [
                "🇭🇰 Coo香港|HK01",
                "🇭🇰 Coo香港|HK02",
                "🇭🇰 Coo香港|HK03",
                "🇭🇰 Coo香港|HK04",
                "🇭🇰 Coo香港|HK05",
                "🇭🇰 Coo香港|HK06",
                "🇭🇰 Coo香港|HK07",
                "🇭🇰 Coo香港|HK08",
                "🇭🇰 Coo香港|HK09",
                "🇭🇰 Coo香港|HK35",
                "🇭🇰 1yunti[trojan] 香港 01",
                "🇭🇰 1yunti[trojan] 香港 02",
                "🇭🇰 1yunti[trojan] 香港 03",
                "🇭🇰 1yunti[trojan] 香港 04",
                "🇭🇰 1yunti[trojan] 香港 05",
                "🇭🇰 1yunti[trojan] 香港 06",
                "🇭🇰 1yunti[trojan] 香港 07",
                "🇭🇰 1yunti[trojan] 香港 08",
                "🇭🇰 1yunti[trojan] 香港 09",
                "🇭🇰 1yunti[trojan] 香港 10",
                "🇭🇰 1yunti[trojan] 香港 11",
                "🇭🇰 1yunti[trojan] 香港 12",
                "🇭🇰 1yunti[trojan] 香港 13",
                "🇭🇰 1yunti[trojan] 香港 14",
                "🇭🇰 1yunti[trojan] 香港 15",
                "🇭🇰 1yunti[trojan] 香港 16",
                "🇭🇰 1yunti[trojan] 香港 17",
                "🇭🇰 1yunti[trojan] 香港 18",
                "🇭🇰 1yunti[trojan] 香港 19",
                "🇭🇰 1yunti[trojan] 香港 20"
            ]
        },
        {
            "tag": "TaiWan",
            "type": "urltest",
            "outbounds": [
                "🇹🇼 Coo台湾|TW02",
                "🇹🇼 1yunti[trojan] 台湾 01",
                "🇹🇼 1yunti[trojan] 台湾 02",
                "🇹🇼 1yunti[trojan] 台湾 03",
                "🇹🇼 1yunti[trojan] 台湾 04",
                "🇹🇼 1yunti[trojan] 台湾 05",
                "🇹🇼 1yunti[trojan] 台湾 06",
                "🇹🇼 1yunti[trojan] 台湾 07",
                "🇹🇼 1yunti[trojan] 台湾 08",
                "🇹🇼 1yunti[trojan] 台湾 09",
                "🇹🇼 1yunti[trojan] 台湾 10"
            ]
        },
        {
            "tag": "Singapore",
            "type": "urltest",
            "outbounds": [
                "🇸🇬 Coo新加坡|SG01",
                "🇸🇬 Coo新加坡|SG02",
                "🇸🇬 Coo新加坡|SG03",
                "🇸🇬 Coo新加坡|SG04",
                "🇸🇬 Coo新加坡|SG05",
                "🇸🇬 Coo新加坡|SG06",
                "🇸🇬 Coo新加坡|SG07",
                "🇸🇬 Coo新加坡|SG08",
                "🇸🇬 Coo新加坡|SG09",
                "🇸🇬 1yunti[trojan] 新加坡 01",
                "🇸🇬 1yunti[trojan] 新加坡 02",
                "🇸🇬 1yunti[trojan] 新加坡 03",
                "🇸🇬 1yunti[trojan] 新加坡 04",
                "🇸🇬 1yunti[trojan] 新加坡 05",
                "🇸🇬 1yunti[trojan] 新加坡 06",
                "🇸🇬 1yunti[trojan] 新加坡 07",
                "🇸🇬 1yunti[trojan] 新加坡 08",
                "🇸🇬 1yunti[trojan] 新加坡 09",
                "🇸🇬 1yunti[trojan] 新加坡 10"
            ]
        },
        {
            "tag": "Japan",
            "type": "urltest",
            "outbounds": [
                "🇯🇵 Coo日本|T01",
                "🇯🇵 Coo日本|T02",
                "🇯🇵 Coo日本|T03",
                "🇯🇵 Coo日本|T04",
                "🇯🇵 Coo日本|T05",
                "🇯🇵 Coo日本|T06",
                "🇯🇵 Coo日本|T09",
                "🇯🇵 1yunti[trojan] 日本 01",
                "🇯🇵 1yunti[trojan] 日本 02",
                "🇯🇵 1yunti[trojan] 日本 03",
                "🇯🇵 1yunti[trojan] 日本 04",
                "🇯🇵 1yunti[trojan] 日本 05",
                "🇯🇵 1yunti[trojan] 日本 06",
                "🇯🇵 1yunti[trojan] 日本 07",
                "🇯🇵 1yunti[trojan] 日本 08",
                "🇯🇵 1yunti[trojan] 日本 09",
                "🇯🇵 1yunti[trojan] 日本 10"
            ]
        },
        {
            "tag": "America",
            "type": "urltest",
            "outbounds": [
                "🇺🇸 Coo美国|DA1",
                "🇺🇸 Coo美国|KS1",
                "🇺🇸 Coo美国|NY1",
                "🇺🇸 Coo美国|LA1",
                "🇺🇸 Coo美国|LA2",
                "🇺🇸 Coo美国|PHX1",
                "🇺🇸 Coo美国|SEA1",
                "🇺🇸 Coo美国|SJ0",
                "🇺🇸 1yunti[trojan] 美国 01",
                "🇺🇸 1yunti[trojan] 美国 02",
                "🇺🇸 1yunti[trojan] 美国 03",
                "🇺🇸 1yunti[trojan] 美国 04",
                "🇺🇸 1yunti[trojan] 美国 05",
                "🇺🇸 1yunti[trojan] 美国 06",
                "🇺🇸 1yunti[trojan] 美国 07",
                "🇺🇸 1yunti[trojan] 美国 08",
                "🇺🇸 1yunti[trojan] 美国 09",
                "🇺🇸 1yunti[trojan] 美国 10"
            ]
        },
        {
            "tag": "Others",
            "type": "urltest",
            "outbounds": [
                "Coo剩余流量：135.52 GB",
                "Coo距离下次重置剩余：22 天",
                "Coo套餐到期：2024-11-23",
                "Coohttps://web.coo.wiki",
                "🇰🇷 Coo韩国|SEL2",
                "🇵🇭 Coo菲律宾|MNL2",
                "🇲🇾 Coo马来西亚|MAS1|x9",
                "🇦🇺 Coo澳大利亚|SYD1",
                "🇨🇦 Coo加拿大|CA1",
                "🇦🇷 Coo阿根廷|BA1|50M",
                "🇬🇧 Coo英国|COV2",
                "🇩🇪 Coo德国|FRA1",
                "🇫🇷 Coo法国|PAR1",
                "🇮🇹 Coo意大利|MIL1",
                "🇹🇷 Coo土耳其|IST1",
                "1yunti[trojan] 最新网址：1yunti.com",
                "1yunti[trojan] 剩余流量：95.38 GB",
                "1yunti[trojan] 距离下次重置剩余：27 天",
                "1yunti[trojan] 套餐到期：2025-09-28",
                "🇰🇷 1yunti[trojan] 韩国01",
                "🇰🇷 1yunti[trojan] 韩国02",
                "🇰🇷 1yunti[trojan] 韩国03",
                "🇲🇾 1yunti[trojan] 马来西亚 01",
                "🇲🇾 1yunti[trojan] 马来西亚 02",
                "🇲🇾 1yunti[trojan] 马来西亚 03",
                "🇲🇾 1yunti[trojan] 马来西亚 04",
                "🇲🇾 1yunti[trojan] 马来西亚 05",
                "🇬🇧 1yunti[trojan] 英国 01",
                "🇬🇧 1yunti[trojan] 英国 02",
                "🇬🇧 1yunti[trojan] 英国 03",
                "🇬🇧 1yunti[trojan] 英国 04",
                "🇬🇧 1yunti[trojan] 英国 05",
                "🇹🇭 1yunti[trojan] 泰国 01",
                "🇹🇭 1yunti[trojan] 泰国 02",
                "🇻🇳 1yunti[trojan] 越南 01",
                "🇻🇳 1yunti[trojan] 越南 02",
                "🇵🇭 1yunti[trojan] 菲律宾 01",
                "🇵🇭 1yunti[trojan] 菲律宾 02",
                "🇮🇳 1yunti[trojan] 印度 01",
                "🇹🇷 1yunti[trojan] 土耳其 01",
                "🇹🇷 1yunti[trojan] 土耳其 02",
                "🇦🇷 1yunti[trojan] 阿根廷 01",
                "🇦🇷 1yunti[trojan] 阿根廷 02"
            ]
        },
        {
            "tag": "Auto",
            "type": "urltest",
            "outbounds": [
                "Coo套餐到期：2024-11-23",
                "Coohttps://web.coo.wiki",
                "🇭🇰 Coo香港|HK01",
                "🇭🇰 Coo香港|HK02",
                "🇭🇰 Coo香港|HK03",
                "🇭🇰 Coo香港|HK04",
                "🇭🇰 Coo香港|HK05",
                "🇭🇰 Coo香港|HK06",
                "🇭🇰 Coo香港|HK07",
                "🇭🇰 Coo香港|HK08",
                "🇭🇰 Coo香港|HK09",
                "🇭🇰 Coo香港|HK35",
                "🇹🇼 Coo台湾|TW02",
                "🇯🇵 Coo日本|T01",
                "🇯🇵 Coo日本|T02",
                "🇯🇵 Coo日本|T03",
                "🇯🇵 Coo日本|T04",
                "🇯🇵 Coo日本|T05",
                "🇯🇵 Coo日本|T06",
                "🇯🇵 Coo日本|T09",
                "🇰🇷 Coo韩国|SEL2",
                "🇸🇬 Coo新加坡|SG01",
                "🇸🇬 Coo新加坡|SG02",
                "🇸🇬 Coo新加坡|SG03",
                "🇸🇬 Coo新加坡|SG04",
                "🇸🇬 Coo新加坡|SG05",
                "🇸🇬 Coo新加坡|SG06",
                "🇸🇬 Coo新加坡|SG07",
                "🇸🇬 Coo新加坡|SG08",
                "🇸🇬 Coo新加坡|SG09",
                "🇵🇭 Coo菲律宾|MNL2",
                "🇲🇾 Coo马来西亚|MAS1|x9",
                "🇦🇺 Coo澳大利亚|SYD1",
                "🇺🇸 Coo美国|DA1",
                "🇺🇸 Coo美国|KS1",
                "🇺🇸 Coo美国|NY1",
                "🇺🇸 Coo美国|LA1",
                "🇺🇸 Coo美国|LA2",
                "🇺🇸 Coo美国|PHX1",
                "🇺🇸 Coo美国|SEA1",
                "🇺🇸 Coo美国|SJ0",
                "🇨🇦 Coo加拿大|CA1",
                "🇦🇷 Coo阿根廷|BA1|50M",
                "🇬🇧 Coo英国|COV2",
                "🇩🇪 Coo德国|FRA1",
                "🇫🇷 Coo法国|PAR1",
                "🇮🇹 Coo意大利|MIL1",
                "🇹🇷 Coo土耳其|IST1",
                "1yunti[trojan] 最新网址：1yunti.com",
                "1yunti[trojan] 套餐到期：2025-09-28",
                "🇭🇰 1yunti[trojan] 香港 01",
                "🇭🇰 1yunti[trojan] 香港 02",
                "🇭🇰 1yunti[trojan] 香港 03",
                "🇭🇰 1yunti[trojan] 香港 04",
                "🇭🇰 1yunti[trojan] 香港 05",
                "🇭🇰 1yunti[trojan] 香港 06",
                "🇭🇰 1yunti[trojan] 香港 07",
                "🇭🇰 1yunti[trojan] 香港 08",
                "🇭🇰 1yunti[trojan] 香港 09",
                "🇭🇰 1yunti[trojan] 香港 10",
                "🇭🇰 1yunti[trojan] 香港 11",
                "🇭🇰 1yunti[trojan] 香港 12",
                "🇭🇰 1yunti[trojan] 香港 13",
                "🇭🇰 1yunti[trojan] 香港 14",
                "🇭🇰 1yunti[trojan] 香港 15",
                "🇭🇰 1yunti[trojan] 香港 16",
                "🇭🇰 1yunti[trojan] 香港 17",
                "🇭🇰 1yunti[trojan] 香港 18",
                "🇭🇰 1yunti[trojan] 香港 19",
                "🇭🇰 1yunti[trojan] 香港 20",
                "🇹🇼 1yunti[trojan] 台湾 01",
                "🇹🇼 1yunti[trojan] 台湾 02",
                "🇹🇼 1yunti[trojan] 台湾 03",
                "🇹🇼 1yunti[trojan] 台湾 04",
                "🇹🇼 1yunti[trojan] 台湾 05",
                "🇹🇼 1yunti[trojan] 台湾 06",
                "🇹🇼 1yunti[trojan] 台湾 07",
                "🇹🇼 1yunti[trojan] 台湾 08",
                "🇹🇼 1yunti[trojan] 台湾 09",
                "🇹🇼 1yunti[trojan] 台湾 10",
                "🇸🇬 1yunti[trojan] 新加坡 01",
                "🇸🇬 1yunti[trojan] 新加坡 02",
                "🇸🇬 1yunti[trojan] 新加坡 03",
                "🇸🇬 1yunti[trojan] 新加坡 04",
                "🇸🇬 1yunti[trojan] 新加坡 05",
                "🇸🇬 1yunti[trojan] 新加坡 06",
                "🇸🇬 1yunti[trojan] 新加坡 07",
                "🇸🇬 1yunti[trojan] 新加坡 08",
                "🇸🇬 1yunti[trojan] 新加坡 09",
                "🇸🇬 1yunti[trojan] 新加坡 10",
                "🇯🇵 1yunti[trojan] 日本 01",
                "🇯🇵 1yunti[trojan] 日本 02",
                "🇯🇵 1yunti[trojan] 日本 03",
                "🇯🇵 1yunti[trojan] 日本 04",
                "🇯🇵 1yunti[trojan] 日本 05",
                "🇯🇵 1yunti[trojan] 日本 06",
                "🇯🇵 1yunti[trojan] 日本 07",
                "🇯🇵 1yunti[trojan] 日本 08",
                "🇯🇵 1yunti[trojan] 日本 09",
                "🇯🇵 1yunti[trojan] 日本 10",
                "🇺🇸 1yunti[trojan] 美国 01",
                "🇺🇸 1yunti[trojan] 美国 02",
                "🇺🇸 1yunti[trojan] 美国 03",
                "🇺🇸 1yunti[trojan] 美国 04",
                "🇺🇸 1yunti[trojan] 美国 05",
                "🇺🇸 1yunti[trojan] 美国 06",
                "🇺🇸 1yunti[trojan] 美国 07",
                "🇺🇸 1yunti[trojan] 美国 08",
                "🇺🇸 1yunti[trojan] 美国 09",
                "🇺🇸 1yunti[trojan] 美国 10",
                "🇰🇷 1yunti[trojan] 韩国01",
                "🇰🇷 1yunti[trojan] 韩国02",
                "🇰🇷 1yunti[trojan] 韩国03",
                "🇲🇾 1yunti[trojan] 马来西亚 01",
                "🇲🇾 1yunti[trojan] 马来西亚 02",
                "🇲🇾 1yunti[trojan] 马来西亚 03",
                "🇲🇾 1yunti[trojan] 马来西亚 04",
                "🇲🇾 1yunti[trojan] 马来西亚 05",
                "🇬🇧 1yunti[trojan] 英国 01",
                "🇬🇧 1yunti[trojan] 英国 02",
                "🇬🇧 1yunti[trojan] 英国 03",
                "🇬🇧 1yunti[trojan] 英国 04",
                "🇬🇧 1yunti[trojan] 英国 05",
                "🇹🇭 1yunti[trojan] 泰国 01",
                "🇹🇭 1yunti[trojan] 泰国 02",
                "🇻🇳 1yunti[trojan] 越南 01",
                "🇻🇳 1yunti[trojan] 越南 02",
                "🇵🇭 1yunti[trojan] 菲律宾 01",
                "🇵🇭 1yunti[trojan] 菲律宾 02",
                "🇮🇳 1yunti[trojan] 印度 01",
                "🇹🇷 1yunti[trojan] 土耳其 01",
                "🇹🇷 1yunti[trojan] 土耳其 02",
                "🇦🇷 1yunti[trojan] 阿根廷 01",
                "🇦🇷 1yunti[trojan] 阿根廷 02"
            ],
            "url": "http://www.gstatic.com/generate_204",
            "interval": "10m",
            "tolerance": 50
        },
        {
            "type": "direct",
            "tag": "Direct"
        },
        {
            "type": "dns",
            "tag": "dns-out"
        },
        {
            "type": "block",
            "tag": "block"
        },
        {
            "tag": "Coo剩余流量：135.52 GB",
            "type": "shadowsocks",
            "server": "a88jxt0ag9rxr6nh3kx120ujro2k7hhn.02.02.hk.k7h.lol",
            "server_port": 24517,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "Coo距离下次重置剩余：22 天",
            "type": "shadowsocks",
            "server": "a88jxt0ag9rxr6nh3kx120ujro2k7hhn.02.02.hk.k7h.lol",
            "server_port": 24517,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "Coo套餐到期：2024-11-23",
            "type": "shadowsocks",
            "server": "a88jxt0ag9rxr6nh3kx120ujro2k7hhn.02.02.hk.k7h.lol",
            "server_port": 24517,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "Coohttps://web.coo.wiki",
            "type": "shadowsocks",
            "server": "a88jxt0ag9rxr6nh3kx120ujro2k7hhn.02.02.hk.k7h.lol",
            "server_port": 24517,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇭🇰 Coo香港|HK01",
            "type": "shadowsocks",
            "server": "5rseoqesqi9kkti0ix3vscsfjisihumc.02.01.hk.k7h.lol",
            "server_port": 40803,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇭🇰 Coo香港|HK02",
            "type": "shadowsocks",
            "server": "a88jxt0ag9rxr6nh3kx120ujro2k7hhn.02.02.hk.k7h.lol",
            "server_port": 24517,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇭🇰 Coo香港|HK03",
            "type": "shadowsocks",
            "server": "omdvbv6o0fmntv24pguemm1e1c9xoitt.02.03.hk.k7h.lol",
            "server_port": 22299,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇭🇰 Coo香港|HK04",
            "type": "shadowsocks",
            "server": "h21kbmst5x3f0wmo81ycwwjtckp4m43k.02.04.hk.k7h.lol",
            "server_port": 49486,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇭🇰 Coo香港|HK05",
            "type": "shadowsocks",
            "server": "5w2cfszgu9jlese7doiirqutvkyjyh8t.02.05.hk.k7h.lol",
            "server_port": 48464,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇭🇰 Coo香港|HK06",
            "type": "shadowsocks",
            "server": "72gnoyiipm7s6632cnoe133b3oypisur.06.02.hk.k7h.lol",
            "server_port": 37870,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇭🇰 Coo香港|HK07",
            "type": "shadowsocks",
            "server": "73tep7is4f78ch4os321xr6c3gee8i8j.02.07.hk.k7h.lol",
            "server_port": 44244,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇭🇰 Coo香港|HK08",
            "type": "shadowsocks",
            "server": "682l4fbqz003i3jtbgyvga5kcr74y70n.02.08.hk.k7h.lol",
            "server_port": 44071,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇭🇰 Coo香港|HK09",
            "type": "shadowsocks",
            "server": "mkxxwy9gyvusdc38tiv5uwctxglotm2z.02.09.hk.k7h.lol",
            "server_port": 24616,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇭🇰 Coo香港|HK35",
            "type": "shadowsocks",
            "server": "mkxxwy9gyvusdc38tiv5uwctxglotm2z.02.09.hk.k7h.lol",
            "server_port": 43938,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇹🇼 Coo台湾|TW02",
            "type": "shadowsocks",
            "server": "bi7i3q42lcfeniv96obnyzkm4wzzsznx.02.02.tw.k7h.lol",
            "server_port": 35805,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇯🇵 Coo日本|T01",
            "type": "shadowsocks",
            "server": "5nokkdltjvw1kkwdlisf11li6usi55rx.02.01.jp.k7h.lol",
            "server_port": 20038,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇯🇵 Coo日本|T02",
            "type": "shadowsocks",
            "server": "63cle0b2dsbtg3didloy7x9j8w45s9bo.02.02.jp.k7h.lol",
            "server_port": 10954,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇯🇵 Coo日本|T03",
            "type": "shadowsocks",
            "server": "n474xiflrzj87y3ffcw17yysy8o90uho.02.03.jp.k7h.lol",
            "server_port": 40546,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇯🇵 Coo日本|T04",
            "type": "shadowsocks",
            "server": "t2kd3ohzlq0g7yxnhb1lr4m6hla1jgn0.02.04.jp.k7h.lol",
            "server_port": 36708,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇯🇵 Coo日本|T05",
            "type": "shadowsocks",
            "server": "rwxq9w124e1wyphavr5ra3xp2410oguu.02.05.jp.k7h.lol",
            "server_port": 23718,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇯🇵 Coo日本|T06",
            "type": "shadowsocks",
            "server": "d5a2r3t41eiqpo9zg4efjhq9gnkea50q.02.06.jp.k7h.lol",
            "server_port": 13465,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇯🇵 Coo日本|T09",
            "type": "shadowsocks",
            "server": "303mvgjl20b08r4udccvobdcp5oylubc.02.09.jp.k7h.lol",
            "server_port": 27334,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇰🇷 Coo韩国|SEL2",
            "type": "shadowsocks",
            "server": "6p4ekafubrl53g3xu56psxtlq75zwu5p.02.02.kr.k7h.lol",
            "server_port": 23464,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇸🇬 Coo新加坡|SG01",
            "type": "shadowsocks",
            "server": "guzvqtqrqcieoacbz5vtz3f5skvgchm8.02.01.sg.k7h.lol",
            "server_port": 34781,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇸🇬 Coo新加坡|SG02",
            "type": "shadowsocks",
            "server": "906ns1ge9szdpmb4icw95tpobkdrqtnd.02.02.sg.k7h.lol",
            "server_port": 14556,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇸🇬 Coo新加坡|SG03",
            "type": "shadowsocks",
            "server": "g99zbeh1hw3tivh4wauqp7hu2vivi9ul.02.03.sg.k7h.lol",
            "server_port": 24219,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇸🇬 Coo新加坡|SG04",
            "type": "shadowsocks",
            "server": "5efxs73gm7iagunylwfxa0v8yeu2r09h.02.04.sg.k7h.lol",
            "server_port": 43885,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇸🇬 Coo新加坡|SG05",
            "type": "shadowsocks",
            "server": "qj5n1xmcqzeiedv76tj9sj1eo5z4qule.02.05.sg.k7h.lol",
            "server_port": 48641,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇸🇬 Coo新加坡|SG06",
            "type": "shadowsocks",
            "server": "whdxownhpgrny0ehzcd6ebx1yag2dvqt.02.06.sg.k7h.lol",
            "server_port": 26515,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇸🇬 Coo新加坡|SG07",
            "type": "shadowsocks",
            "server": "tqskgw4tzjp5vw6qcj7wpxwvuynne8mj.02.07.sg.k7h.lol",
            "server_port": 19310,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇸🇬 Coo新加坡|SG08",
            "type": "shadowsocks",
            "server": "lw4ixtrilaeb1lnhr5fyx3j6ed7qkbeu.02.08.sg.k7h.lol",
            "server_port": 35197,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇸🇬 Coo新加坡|SG09",
            "type": "shadowsocks",
            "server": "2y0p0s1ww7sbxmb58kis6ijas9belb4u.02.09.sg.k7h.lol",
            "server_port": 47558,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇵🇭 Coo菲律宾|MNL2",
            "type": "shadowsocks",
            "server": "4i3fp76pu8b2mumxe70rci28n9iws11z.02.02.ph.k7h.lol",
            "server_port": 31865,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇲🇾 Coo马来西亚|MAS1|x9",
            "type": "shadowsocks",
            "server": "a1wzguka5uiztkpl0ikzo4l5wkmdti5z.02.01.mas.k7h.lol",
            "server_port": 31877,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇦🇺 Coo澳大利亚|SYD1",
            "type": "shadowsocks",
            "server": "zuuh3pbt6244icucpzvmlset2zqnj8j9.02.01.au.k7h.lol",
            "server_port": 34583,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇺🇸 Coo美国|DA1",
            "type": "shadowsocks",
            "server": "mgdn805zf58f6hiwtjnq0bt4nfuikzoo.02.01.us.k7h.lol",
            "server_port": 15513,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇺🇸 Coo美国|KS1",
            "type": "shadowsocks",
            "server": "ylsh38hoz1fc4q9u34ouwyd01sai3pdq.02.02.us.k7h.lol",
            "server_port": 14506,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇺🇸 Coo美国|NY1",
            "type": "shadowsocks",
            "server": "6tva728ubipghax8htexft9y23yxv0p0.02.03.us.k7h.lol",
            "server_port": 49465,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇺🇸 Coo美国|LA1",
            "type": "shadowsocks",
            "server": "bz67lvq71cky0fprpm7fqy8vw4d0bq8c.02.04.us.k7h.lol",
            "server_port": 17201,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇺🇸 Coo美国|LA2",
            "type": "shadowsocks",
            "server": "9grigcjf750qos5ay3ch26tiyyxxqun4.02.05.us.k7h.lol",
            "server_port": 44432,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇺🇸 Coo美国|PHX1",
            "type": "shadowsocks",
            "server": "8vj8m0jrc1zhixoefv2ad25z4gpc20ip.02.06.us.k7h.lol",
            "server_port": 34467,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇺🇸 Coo美国|SEA1",
            "type": "shadowsocks",
            "server": "mbhe6nslbiq4qovnyx5603ltgylg2suy.02.07.us.k7h.lol",
            "server_port": 38322,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇺🇸 Coo美国|SJ0",
            "type": "shadowsocks",
            "server": "ykq18yj581mo50sksgxc452v7pampj6w.02.08.us.k7h.lol",
            "server_port": 29126,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇨🇦 Coo加拿大|CA1",
            "type": "shadowsocks",
            "server": "cz9ztk0ocse9adoig5sqqgqrkbl0msn6.02.01.ca.k7h.lol",
            "server_port": 19915,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇦🇷 Coo阿根廷|BA1|50M",
            "type": "shadowsocks",
            "server": "758yv0yahukequ3ba5el38xiz6u1yeo4.02.01.ar.k7h.lol",
            "server_port": 17636,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇬🇧 Coo英国|COV2",
            "type": "shadowsocks",
            "server": "gpfqf9d1poysctbgfh9lm8y7lf7wuuml.02.02.uk.k7h.lol",
            "server_port": 18127,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇩🇪 Coo德国|FRA1",
            "type": "shadowsocks",
            "server": "jef20t3hhgi49hqubitpy4ytrt5qnzv1.02.01.de.k7h.lol",
            "server_port": 46247,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇫🇷 Coo法国|PAR1",
            "type": "shadowsocks",
            "server": "azch00zemfy0945m560w82z650andhle.02.01.fr.k7h.lol",
            "server_port": 15715,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇮🇹 Coo意大利|MIL1",
            "type": "shadowsocks",
            "server": "llwsbpu765uu86ihz88yqy4hu3rbehpd.02.01.it.k7h.lol",
            "server_port": 44191,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "🇹🇷 Coo土耳其|IST1",
            "type": "shadowsocks",
            "server": "7e8ug9usl8npxl6rh793lglzzgue0itf.02.01.tr.k7h.lol",
            "server_port": 41109,
            "method": "chacha20-ietf-poly1305",
            "password": "32e377c8-1cfe-4071-96d6-ed36b7c1dd58"
        },
        {
            "tag": "1yunti[trojan] 最新网址：1yunti.com",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56301,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "1yunti[trojan] 剩余流量：95.38 GB",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56301,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "1yunti[trojan] 距离下次重置剩余：27 天",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56301,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "1yunti[trojan] 套餐到期：2025-09-28",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56301,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56301,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56302,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 03",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56303,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 04",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56304,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 05",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56305,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 06",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56306,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 07",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56307,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 08",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56308,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 09",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56309,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 10",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56310,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 11",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56311,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 12",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56312,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 13",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56313,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 14",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56314,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 15",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56315,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 16",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56316,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 17",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56317,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 18",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56318,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 19",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56319,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇭🇰 1yunti[trojan] 香港 20",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-hk.1ytnode.com",
            "server_port": 56320,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇼 1yunti[trojan] 台湾 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tw.1ytnode.com",
            "server_port": 56321,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇼 1yunti[trojan] 台湾 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tw.1ytnode.com",
            "server_port": 56322,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇼 1yunti[trojan] 台湾 03",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tw.1ytnode.com",
            "server_port": 56323,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇼 1yunti[trojan] 台湾 04",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tw.1ytnode.com",
            "server_port": 56324,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇼 1yunti[trojan] 台湾 05",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tw.1ytnode.com",
            "server_port": 56325,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇼 1yunti[trojan] 台湾 06",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tw.1ytnode.com",
            "server_port": 56326,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇼 1yunti[trojan] 台湾 07",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tw.1ytnode.com",
            "server_port": 56327,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇼 1yunti[trojan] 台湾 08",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tw.1ytnode.com",
            "server_port": 56328,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇼 1yunti[trojan] 台湾 09",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tw.1ytnode.com",
            "server_port": 56329,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇼 1yunti[trojan] 台湾 10",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tw.1ytnode.com",
            "server_port": 56330,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇸🇬 1yunti[trojan] 新加坡 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-sg.1ytnode.com",
            "server_port": 56331,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇸🇬 1yunti[trojan] 新加坡 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-sg.1ytnode.com",
            "server_port": 56332,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇸🇬 1yunti[trojan] 新加坡 03",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-sg.1ytnode.com",
            "server_port": 56333,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇸🇬 1yunti[trojan] 新加坡 04",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-sg.1ytnode.com",
            "server_port": 56334,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇸🇬 1yunti[trojan] 新加坡 05",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-sg.1ytnode.com",
            "server_port": 56335,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇸🇬 1yunti[trojan] 新加坡 06",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-sg.1ytnode.com",
            "server_port": 56336,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇸🇬 1yunti[trojan] 新加坡 07",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-sg.1ytnode.com",
            "server_port": 56337,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇸🇬 1yunti[trojan] 新加坡 08",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-sg.1ytnode.com",
            "server_port": 56338,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇸🇬 1yunti[trojan] 新加坡 09",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-sg.1ytnode.com",
            "server_port": 56339,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇸🇬 1yunti[trojan] 新加坡 10",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-sg.1ytnode.com",
            "server_port": 56340,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇯🇵 1yunti[trojan] 日本 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-jp.1ytnode.com",
            "server_port": 56341,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇯🇵 1yunti[trojan] 日本 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-jp.1ytnode.com",
            "server_port": 56342,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇯🇵 1yunti[trojan] 日本 03",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-jp.1ytnode.com",
            "server_port": 56343,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇯🇵 1yunti[trojan] 日本 04",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-jp.1ytnode.com",
            "server_port": 56344,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇯🇵 1yunti[trojan] 日本 05",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-jp.1ytnode.com",
            "server_port": 56345,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇯🇵 1yunti[trojan] 日本 06",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-jp.1ytnode.com",
            "server_port": 56346,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇯🇵 1yunti[trojan] 日本 07",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-jp.1ytnode.com",
            "server_port": 56347,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇯🇵 1yunti[trojan] 日本 08",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-jp.1ytnode.com",
            "server_port": 56348,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇯🇵 1yunti[trojan] 日本 09",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-jp.1ytnode.com",
            "server_port": 56349,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇯🇵 1yunti[trojan] 日本 10",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-jp.1ytnode.com",
            "server_port": 56350,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇺🇸 1yunti[trojan] 美国 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-us.1ytnode.com",
            "server_port": 56351,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇺🇸 1yunti[trojan] 美国 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-us.1ytnode.com",
            "server_port": 56352,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇺🇸 1yunti[trojan] 美国 03",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-us.1ytnode.com",
            "server_port": 56353,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇺🇸 1yunti[trojan] 美国 04",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-us.1ytnode.com",
            "server_port": 56354,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇺🇸 1yunti[trojan] 美国 05",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-us.1ytnode.com",
            "server_port": 56355,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇺🇸 1yunti[trojan] 美国 06",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-us.1ytnode.com",
            "server_port": 56356,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇺🇸 1yunti[trojan] 美国 07",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-us.1ytnode.com",
            "server_port": 56357,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇺🇸 1yunti[trojan] 美国 08",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-us.1ytnode.com",
            "server_port": 56358,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇺🇸 1yunti[trojan] 美国 09",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-us.1ytnode.com",
            "server_port": 56359,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇺🇸 1yunti[trojan] 美国 10",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-us.1ytnode.com",
            "server_port": 56360,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇰🇷 1yunti[trojan] 韩国01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-kr.1ytnode.com",
            "server_port": 56361,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇰🇷 1yunti[trojan] 韩国02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-kr.1ytnode.com",
            "server_port": 56362,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇰🇷 1yunti[trojan] 韩国03",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-kr.1ytnode.com",
            "server_port": 56363,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇲🇾 1yunti[trojan] 马来西亚 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-my.1ytnode.com",
            "server_port": 56366,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇲🇾 1yunti[trojan] 马来西亚 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-my.1ytnode.com",
            "server_port": 56367,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇲🇾 1yunti[trojan] 马来西亚 03",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-my.1ytnode.com",
            "server_port": 56368,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇲🇾 1yunti[trojan] 马来西亚 04",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-my.1ytnode.com",
            "server_port": 56369,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇲🇾 1yunti[trojan] 马来西亚 05",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-my.1ytnode.com",
            "server_port": 56370,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇬🇧 1yunti[trojan] 英国 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-uk.1ytnode.com",
            "server_port": 56371,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇬🇧 1yunti[trojan] 英国 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-uk.1ytnode.com",
            "server_port": 56372,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇬🇧 1yunti[trojan] 英国 03",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-uk.1ytnode.com",
            "server_port": 56373,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇬🇧 1yunti[trojan] 英国 04",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-uk.1ytnode.com",
            "server_port": 56374,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇬🇧 1yunti[trojan] 英国 05",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-uk.1ytnode.com",
            "server_port": 56375,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇭 1yunti[trojan] 泰国 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-th.1ytnode.com",
            "server_port": 56376,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇭 1yunti[trojan] 泰国 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-th.1ytnode.com",
            "server_port": 56377,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇻🇳 1yunti[trojan] 越南 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-vn.1ytnode.com",
            "server_port": 56378,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇻🇳 1yunti[trojan] 越南 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-vn.1ytnode.com",
            "server_port": 56379,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇵🇭 1yunti[trojan] 菲律宾 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-ph.1ytnode.com",
            "server_port": 56380,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇵🇭 1yunti[trojan] 菲律宾 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-ph.1ytnode.com",
            "server_port": 56381,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇮🇳 1yunti[trojan] 印度 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-in.1ytnode.com",
            "server_port": 56382,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇷 1yunti[trojan] 土耳其 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tr.1ytnode.com",
            "server_port": 56384,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇹🇷 1yunti[trojan] 土耳其 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-tr.1ytnode.com",
            "server_port": 56385,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇦🇷 1yunti[trojan] 阿根廷 01",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-ar.1ytnode.com",
            "server_port": 56388,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        },
        {
            "tag": "🇦🇷 1yunti[trojan] 阿根廷 02",
            "type": "trojan",
            "server": "ip0axv1bbsu02k7-ar.1ytnode.com",
            "server_port": 56389,
            "password": "17af40a3-5695-4f63-a648-d19e6e649a0c",
            "tls": {
                "enabled": true,
                "insecure": true
            }
        }
    ]
    return config
}