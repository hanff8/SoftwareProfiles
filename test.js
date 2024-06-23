let config = JSON.parse($files[0]) // 文件中的第一个
let proxies = await produceArtifact({
    type: 'collection', // 如果是组合订阅 就是 'collection'
    name: 'my-singbox-config', // 订阅的"名称", 不是"显示名称"
    platform: 'sing-box',
    produceType: 'internal'
})

// 先将全部节点结构插到 outbounds
config.outbounds.push(...proxies)

config.outbounds.map(i => {
    // 在 全部节点 中插入全部节点名
    if (['全部节点'].includes(i.tag)) {
        i.outbounds.push(...proxies.map(p => p.tag))
    }

    if (['香港节点'].includes(i.tag)) {
        i.outbounds.push(...proxies.map(p => /香港|🇭🇰|HK|hk|HongKong/i.test(p.tag)).map(p => p.tag))
    }
    if (['美国节点'].includes(i.tag)) {
        i.outbounds.push(...proxies.filter(p => /美国|🇺🇸|us|united states/i.test(p.tag)).map(p => p.tag))
    }
    if (['新加坡节点'].includes(i.tag)) {
        i.outbounds.push(...proxies.filter(p => /新加坡|🇸🇬|SG|Singapore/i.test(p.tag)).map(p => p.tag))
    }
    if (['日本节点'].includes(i.tag)) {
        i.outbounds.push(...proxies.filter(p => /日本|🇯🇵|JP|Japan/i.test(p.tag)).map(p => p.tag))
    }
    if (['台湾节点'].includes(i.tag)) {
        i.outbounds.push(...proxies.filter(p => /台湾|🇹🇼|tw|Taiwan/i.test(p.tag)).map(p => p.tag))
    }
    if (['台湾节点'].includes(i.tag)) {
        i.outbounds.push(...proxies.filter(p => /台湾|🇹🇼|tw|Taiwan/i.test(p.tag)).map(p => p.tag))
    }
})

$content = JSON.stringify(config, null, 2)
