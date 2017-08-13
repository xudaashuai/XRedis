/**
 * Created by xudas on 2017/8/12.
 */
const redis = require('redis')
function reloadKeys(node) {
    client.select(parseInt(node.text[node.text.length - 1]), function () {
        client.keys('*', function (err, mes) {
            node.nodes = []
            for (let i = 0; i < mes.length; i++) {
                client.type(mes[i], function (err, mess) {
                    console.log(mess)
                    node.nodes.push(new Node(mes[i],NODE_TYPE.KEY,VALUE_TYPE[mess]))
                })
            }
        })
    })
}
function reloadDatabase(node) {
    client.config('GET', "databases", function (err, mes) {
        dbsize = mes[1]
        node.nodes = []
        for (let i = 0; i < dbsize; i++) {
            node.nodes.push(new Node("DB" + i.toString(), NODE_TYPE.DATABASE, null))
        }
        node.open=true
    })
}

function show(node, table, info, page) {
    table.type = node.valueType
    info.type = node.valueType
    info.key = node.text
    info.show = true
    info.length = null
    let cursor = page.cursor
    let pageSize = page.pageSize
    console.log(cursor)
    console.log(pageSize)
    switch (node.valueType) {
        case VALUE_TYPE.string:
            info.length=1
            client.get(node.text, function (err, mes) {
                console.log(mes)
                table.result = [mes,]
            })
            break;
        case VALUE_TYPE.set:
            client.scard(node.text,function (err,mes) {
                info.length = mes
                page.pageCount = Math.ceil(info.length / pageSize)
            })
            client.sscan(node.text, (cursor - 1) * pageSize, 'COUNT', pageSize, function (err, mes) {
                table.result = mes[1]
            })
            break;
        case VALUE_TYPE.zset:
            client.zcard(node.text,function (err,mes) {
                info.length = mes
                page.pageCount = Math.ceil(info.length / pageSize)
            })
            client.zscan(node.text, (cursor - 1) * pageSize, 'COUNT', pageSize, function (err, mes) {
                table.result = mes[1]
                console.log(mes)
            })
            break;
        case VALUE_TYPE.hash:
            client.hlen(node.text,function (err,mes) {
                info.length = mes
                page.pageCount = Math.ceil(info.length / pageSize)
            })
            client.hscan(node.text, (cursor - 1) * pageSize, 'COUNT', pageSize, function (err, mes) {
                console.log(mes)
                mes=mes[1]
                let m=[]
                for(let i=0;i<mes.length;i+=2){
                    m.push([mes[i],mes[i+1]])
                }
                table.result = m
            })
            break;
        case VALUE_TYPE.list:
            client.llen(node.text,function (err,mes) {
                info.length = mes
                page.pageCount = Math.ceil(info.length / pageSize)
            })
            client.lrange(node.text, (cursor - 1) * pageSize,cursor*pageSize-1,function (err, mes) {
                table.result = mes
                console.log(mes)
            })
            break;
    }
}