/**
 * Created by xudas on 2017/8/12.
 */
const redis = require('ioredis')
function reloadKeys(node) {
    client.select(parseInt(node.text[node.text.length - 1]), function () {
        client.keys('*', function (err, mes) {
            node.nodes = []
            for (let i = 0; i < mes.length; i++) {
                client.type(mes[i],function (err,mess) {
                    console.log(mess)
                    node.nodes.push({
                        id: 1,
                        nodes: [],
                        text: mes[i],
                        valueType:VALUE_TYPE[mess],
                        end: true,
                        open: false,
                        type: NODE_TYPE.KEY
                    })
                })
            }
        })
    })
}
function reloadDatabase(node) {
    client.config('GET', "databases", function (err, mes) {
        dbsize = mes[1]
        node.nodes=[]
        for (let i = 0; i < dbsize; i++) {
            node.nodes.push({
                id: i,
                nodes: [],
                text: "DB" + i.toString(),
                deep: 2,
                type: NODE_TYPE.DATABASE,
                end: false,
                open: false
            })
        }
    })
}

function show(node,table,info,page) {
    table.type=node.valueType
    info.type=node.valueType
    info.key=node.text
    info.show=true
    info.length=null
    let cursor=page.cursor
    let pageSize=page.pageSize
    console.log(node.valueType)
    switch (node.valueType){
        case VALUE_TYPE.string:
            client.get(node.text,function (err,mes) {
                console.log(mes)
                table.result=[mes,]
            })
            break;
        case VALUE_TYPE.set:
            client.sscan(node.text, (cursor-1)*pageSize, 'COUNT', cursor*pageSize,function (err,mes) {
                table.result=mes[1]
                info.length=mes[0]
                page.pageCount=Math.ceil(info.length/pageSize)
            })
            break;
        case VALUE_TYPE.zset:
            client.zscan(node.text,(cursor-1)*pageSize, 'COUNT', cursor*pageSize,function (err,mes) {
                table.result=mes[1]
                info.length=mes[0]
                page.pageCount=Math.ceil(info.length/pageSize)
            })
            break;
        case VALUE_TYPE.hash:
            client.get(node.text,function (err,mes) {
                table.result=mes
            })
            break;
        case VALUE_TYPE.list:
            client.get(node.text,function (err,mes) {
                table.result=mes[1]
                info.length=mes[0]
                page.pageCount=Math.ceil(info.length/pageSize)
            })
            break;
    }
}