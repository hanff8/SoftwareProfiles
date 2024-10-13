// https://mihomo.party/guides/function/override/js/

// 国内DNS服务器
const domesticNameservers = [
    "https://dns.alidns.com/dns-query", // 阿里云公共DNS
    "https://doh.pub/dns-query", // 腾讯DNSPod
    "https://doh.360.cn/dns-query" // 360安全DNS
];
// 国外DNS服务器
const foreignNameservers = [
    "https://1.1.1.1/dns-query", // Cloudflare(主)
    "https://1.0.0.1/dns-query", // Cloudflare(备)
    "https://208.67.222.222/dns-query", // OpenDNS(主)
    "https://208.67.220.220/dns-query", // OpenDNS(备)
    "https://194.242.2.2/dns-query", // Mullvad(主)
    "https://194.242.2.3/dns-query" // Mullvad(备)
];
// DNS配置
const dnsConfig = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "ipv6": true,
    "use-system-hosts": false,
    "cache-algorithm": "arc",
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": [
        // 本地主机/设备
        "+.lan",
        "+.local",
        // Windows网络出现小地球图标
        "+.msftconnecttest.com",
        "+.msftncsi.com",
        // QQ快速登录检测失败
        "localhost.ptlogin2.qq.com",
        "localhost.sec.qq.com",
        // 微信快速登录检测失败
        "localhost.work.weixin.qq.com"
    ],
    "default-nameserver": ["223.5.5.5", "119.29.29.29", "1.1.1.1", "8.8.8.8"],
    "nameserver": [...domesticNameservers, ...foreignNameservers],
    "proxy-server-nameserver": [...domesticNameservers, ...foreignNameservers],
    "nameserver-policy": {
        "geosite:private,cn,geolocation-cn": domesticNameservers,
        "geosite:google,youtube,telegram,gfw,geolocation-!cn": foreignNameservers
    }
};

const p_urltest = {
    'type': 'http',
    'lazy': true,
    'health-check': {
        'enable': true,
        'url': 'http://www.gstatic.com/generate_204',
        'interval': '3600',
    },
    'exclude-filter': 'x4|x5|x10|17|套餐|剩余|订阅|com|机场|4倍|x1.5|广州|杭州|鞍山|济南|官网',
    'override': {
        'skip-cert-verify': true,
        'udp': true
    }
}

const allnode_urltest = {
    'type': 'url-test',
    'lazy': true,
    'interval': '3600',
    'url': 'http://www.gstatic.com/generate_204',
    'use': ['ALL'],
    'exclude-filter': 'x4|x5|x10|17|套餐|剩余|订阅|com|机场|4倍|x1.5|官网|国际|国内|回国',
}

const allnode = {
    'type': 'select',
    'use': ['ALL'],
    'exclude-filter': 'x4|x5|x10|17|套餐|剩余|订阅|com|机场|4倍|x1.5|官网|国际|国内|回国',
}
const flag_icon_repo = "https://testingcf.jsdelivr.net/gh/lipis/flag-icons@main/flags/1x1/";
const app_icon_repo = "https://testingcf.jsdelivr.net/gh/hanff8/mini@master/Color/"
const clash_verge_rev_repo = "https://testingcf.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/"

const app_group_list = {

    'OpenAI': 'OpenAI.png',
    'Telegram': 'Telegram.png',
    'Steam': 'Steam.png',
    'TikTok': 'TikTok.png',
    'Microsoft': 'Microsoft.png',
    'Youtube': 'YouTube.png',
    'Google': 'Google.png',
    'Pikpak': 'https://siriling.github.io/my-icons/dist/icon/Pikpak.png',
    'Porn': 'Piao.png',
    'Spotify': 'Spotify.png',
}

const country_filter = {
    'JP': 'JP|日本|东京|大阪',
    'KR': 'KR|韩国|首尔',
    'TW': 'TW|台湾|台北',
    'SG': '狮城|新加坡|SG',
    'UK': '伦敦|英国|UK',
    'Turkey': '土耳其|TR',
    'HK': '香港|HK',
    'US': '美国|US|纽约|洛杉矶',
    'China': '广州|杭州|济南|鞍山|上海|北京|东莞|深圳|'
}

const region_group_list = {
    // Country Filter
    'JP': 'jp.svg',
    'KR': 'kr.svg',
    'TW': 'tw.svg',
    'SG': 'sg.svg',
    'UK': 'gb.svg',
    'Turkey': 'tr.svg',
    'HK': 'hk.svg',
    'US': 'us.svg',
}

const rules = [
    "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,Connect",
    "DOMAIN-SUFFIX,services.googleapis.cn,Connect",
    "DOMAIN-SUFFIX,apm.yun.hihonor.com,REJECT",
    "DOMAIN-KEYWORD,ddys,Mainland",
    "DOMAIN-KEYWORD,zhuiyingmao,Mainland",
    "DOMAIN-SUFFIX,iyf.tv,Mainland",
    "DOMAIN-KEYWORD,yinghua,Mainland",
    "DOMAIN-SUFFIX,qianxin.com,REJECT",
    "DOMAIN-KEYWORD,ptt,TW",
    "DOMAIN-SUFFIX,dcard.tw,TW",
    "DOMAIN-SUFFIX,mypikpak.com,Pikpak",
    "DOMAIN-SUFFIX,mypikpak.net,DIRECT",
    "DOMAIN-KEYWORD,sijishe,Connect",
    "RULE-SET,spotify,Spotify,no-resolve",
    "GEOSITE,category-games@cn,Mainland",
    "GEOSITE,cn,Mainland",
    "GEOSITE,private,Mainland",
    "GEOIP,CN,Mainland,no-resolve",
    "GEOIP,lan,Mainland,no-resolve",
    "GEOSITE,openai,OpenAI",
    "GEOSITE,tiktok,TikTok",
    "GEOSITE,category-porn,Porn",
    "GEOSITE,youtube,Youtube",
    "GEOSITE,category-ads-all,REJECT",
    "MATCH,Final"
]

function main(config) {

    const region_group = [];
    Object.entries(region_group_list).forEach(([k, v]) => {
        console.log(region_group_list[k])
        region_group.push({
            'name': k,
            'icon': flag_icon_repo + v,
            ...allnode_urltest,
            'filter': country_filter[k]
        });
        console.log(region_group[k]);
    });
    console.log(region_group);


    const app_group = [];
    Object.entries(app_group_list).forEach(([k, v]) => {
        app_group.push({
            'name': k,
            'icon': v.startsWith('http') ? v : app_icon_repo + v,
            'type': 'select',
            'proxies': ['Connect', 'Mainland'].concat(Object.keys(region_group_list)),
        })
    });
    const common_group = [
        {
            'name': 'Connect',
            'type': 'select',
            'icon': clash_verge_rev_repo + 'adjust.svg',
            'proxies': ['Region', 'Manual', 'Auto', 'DIRECT']
        },
        {
            'name': 'Auto',
            ...allnode_urltest,
            'icon': app_icon_repo + 'Urltest.png'
        },
        {
            'name': 'Manual',
            ...allnode,
            'icon': app_icon_repo + 'Static.png',
        },
        {
            'name': 'Region',
            'type': 'select',
            'icon': app_icon_repo + 'Global.png',
            'proxies': Object.keys(region_group_list),
        },
        {
            'name': 'Final',
            'type': 'select',
            'icon': clash_verge_rev_repo + 'fish.svg',
            'proxies': ['Connect', 'DIRECT']
        },
        {
            'name': 'Mainland',
            'type': 'select',
            'icon': app_icon_repo + 'CN.png',
            'proxies': ['DIRECT', 'Connect']
        }
    ]
    //策略组
    config['proxy-groups'] = [
        ...common_group,
        ...app_group,
        ...region_group,
    ]

    //节点代理，配合substore使用
    config['proxy-providers'] = {
        'ALL': {
            ...p_urltest,
            'url': 'http://127.0.0.1:3000/download/collection/All?target=ClashMeta',
            'path': './all.yaml'
        }
    }
    config['rule-providers'] = {
        'spotify': {
            'type': 'http',
            'behavior': 'classical',
            'url': 'https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Spotify/Spotify.yaml',
            'path': './rules/spotify.yaml'
        },
        'telegram': {
            'type': 'http',
            'behavior': 'classical',
            'url': 'https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram.yaml',
            'path': './rules/telegram.yaml'
        }
    }
    config['proxies'] = [];
    config['rules'] = rules;
    config['dns'] = dnsConfig;

    // console.log(config['proxy-providers'])
    console.log(config)
    return config
}