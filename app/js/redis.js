/**
 * Created by xudas on 2017/8/12.
 */
const redis = require('redis')
function reloadKeys(node) {
    node.status='icon-spinner'
    client=cs[node.pos]
    client.select(parseInt(node.text[node.text.length - 1]), function () {
        client.keys('*', function (err, mes) {
            node.nodes = []
            for (let i = 0; i < mes.length; i++) {
                client.type(mes[i], function (err, mess) {
                    node.nodes.push(new Node(mes[i],NODE_TYPE.KEY,VALUE_TYPE[mess],node.pos))

                })
            }
            node.loaded=true
            node.status='icon-ok'
        })
    })

}
function reloadDatabase(node) {

    node.status='icon-spinner'
    client=cs[node.pos]
    client.config('GET', "databases", function (err, mes) {
        dbsize = mes[1]
        node.nodes = []
        for (let i = 0; i < dbsize; i++) {
            node.nodes.push(new Node("DB" + i.toString(), NODE_TYPE.DATABASE, null,node.pos))
        }
        node.open=true
        node.loaded=true
        node.status='icon-ok'
    })
}

function show(node, table, info, page) {
    client=cs[node.pos]
    table.type = node.valueType
    info.type = node.valueType
    info.key = node.text
    info.show = true
    info.length = null
    let cursor = page.cursor
    let pageSize = page.pageSize
    node.status='icon-spinner'
    switch (node.valueType) {
        case VALUE_TYPE.string:
            info.length=1
            client.get(node.text, function (err, mes) {
                table.result = [mes,]
                node.status='icon-ok'
            })
            break;
        case VALUE_TYPE.set:
            client.scard(node.text,function (err,mes) {
                info.length = mes
                page.pageCount = Math.ceil(info.length / pageSize)
            })
            client.sscan(node.text, (cursor - 1) * pageSize, 'COUNT', pageSize, function (err, mes) {
                table.result = mes[1]
                node.status='icon-ok'
            })
            break;
        case VALUE_TYPE.zset:
            client.zcard(node.text,function (err,mes) {
                info.length = mes
                page.pageCount = Math.ceil(info.length / pageSize)
            })
            client.zscan(node.text, (cursor - 1) * pageSize, 'COUNT', pageSize, function (err, mes) {
                table.result = mes[1]
                node.status='icon-ok'
            })
            break;
        case VALUE_TYPE.hash:
            client.hlen(node.text,function (err,mes) {
                info.length = mes
                page.pageCount = Math.ceil(info.length / pageSize)
            })
            client.hscan(node.text, (cursor - 1) * pageSize, 'COUNT', pageSize, function (err, mes) {
                mes=mes[1]
                let m=[]
                for(let i=0;i<mes.length;i+=2){
                    m.push([mes[i],mes[i+1]])
                }
                table.result = m
                node.status='icon-ok'
            })
            break;
        case VALUE_TYPE.list:
            client.llen(node.text,function (err,mes) {
                info.length = mes
                page.pageCount = Math.ceil(info.length / pageSize)
            })
            client.lrange(node.text, (cursor - 1) * pageSize,cursor*pageSize-1,function (err, mes) {
                table.result = mes
                node.status='icon-ok'
            })
            break;
    }
}