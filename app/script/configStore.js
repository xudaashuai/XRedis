/**
 * Created by xudas on 2017/8/14.
 */
const Store = require('electron-store')
const conf = new Store();
exports.init = function () {
    conf.clear()
    conf.store.connection_names=[]
    conf.store.connections=[]
}
exports.addConnect = function (data) {
    let names = conf.get('connection_names', [])
    console.log(names)
    console.log(data)
    console.log(data.name in names)
    if (names.indexOf(data.name)>=0) {
        return false;
    } else {
        names.push(data.name)
        let conns = conf.get('connections', {})
        conns[data.name] = data
        conf.set('connection_names',names)
        conf.set('connections',conns)
        return true
    }
}
exports.getConnections = function (key) {
    let names = conf.get('connection_names', [])
    let conns = conf.get('connections', {})
    let result=[]
    console.log(conns)
    names.forEach((name)=>result.push(conns[name]))
    return result
}