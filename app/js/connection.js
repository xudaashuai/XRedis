/**
 * Created by xudas on 2017/8/12.
 */

const {remote, ipcRenderer} = require('electron')
let button = document.getElementById('submit')
function getValue(id) {
    return document.getElementById(id).value
}
let app=new Vue({
    el:'#form',
    data:{
        data:{
            port:'6379',
            host:'127.0.0.1',
            name:'新建连接',
            pass:''
        }
    },
    methods: {
        submit: function (events) {
            Object.keys(this.data).forEach(key => {
                if (key !== 'pass' && this.data[key].length === 0) {
                    alert(key + '不能为空')
                    return
                }
            })
            if (ipcRenderer.sendSync('add_connect', this.data)) {
                console.log('yes')
                remote.getCurrentWindow().close()
            } else {
                console.log('no')
                alert('连接名重复了')
            }
        }
    }
})