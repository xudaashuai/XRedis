/**
 * Created by xudas on 2017/8/12.
 */
const {Menu, ipcMain, app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
exports.createConnectWindow = function () {
    let createConntectionWindows = new BrowserWindow({
        width: 375,
        height: 320,
        backgroundColor: '#8c8c8c',
        parent: mainWindow,
        modal: true,
        show: false,
    })
    //createConntectionWindows.setMenu(null)
    createConntectionWindows.on('ready-to-show',()=>{createConntectionWindows.show()})
    createConntectionWindows.loadURL(url.format({
        pathname: path.join(__dirname, '../connection.html'),
        protocol: 'file:',
        slashes: true
    }))

}