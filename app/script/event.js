/**
 * Created by xudas on 2017/8/12.
 */
const {ipcMain,app,BrowserWindow} = require('electron');
const redis=require('redis')
const connect=require('../script/connect')
ipcMain.on('connect',function (event,data) {

    console.log(data)
    client = redis.createClient(data.port,data.host)
    client.on("error", function (err) {
        console.log("Error " + err);
    });
    event.returnValue=true
    BrowserWindow.fromId(id).webContents.send('load_client')
})