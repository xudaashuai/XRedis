/**
 * Created by xudas on 2017/8/12.
 */
const {Menu, ipcMain, app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
exports.createConnectWindow = function (pa) {
    let createConntectionWindows = new BrowserWindow({
        width: 400,
        height: 400,
        backgroundColor:'#8c8c8c',
        parent: pa, modal: true, show: true
    })
    createConntectionWindows.loadURL(url.format({
        pathname: path.join(__dirname, '../connection.html'),
        protocol: 'file:',
        slashes: true
    }))
}