/**
 * Created by xudas on 2017/8/12.
 */
const {ipcMain, app, BrowserWindow,webContents} = require('electron');
const redis = require('redis')
const redisController = require('./redisController')
const config = require('./configStore')
const connect = require('./connect')
ipcMain.on('add_connect', function (event, data) {
    if (config.addConnect(data)) {
        clients.push({data: data})
        cs.push({})
        event.returnValue = true
        mainWindow.webContents.send('add_connect_success',clients.length-1)
    } else {
        event.returnValue = false
    }
})
ipcMain.on('connect', function (event, pos) {
    redisController.connect(clients[pos].data,pos)
})