/**
 * Created by xudas on 2017/8/12.
 */

const {remote, ipcRenderer} = require('electron')
let button = document.getElementById('submit')
function getValue(id) {
    return document.getElementById(id).value
}
button.onclick = function (event) {
    if (ipcRenderer.sendSync('add_connect', {
            name: getValue('name'),
            host: getValue('host'),
            port: getValue('port'),
            pass: getValue('pass')
        })) {
        console.log('yes')
        remote.getCurrentWindow().close()
    } else {
        console.log('no')
        alert('连接名重复了')
    }
}