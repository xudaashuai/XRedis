const {Menu, ipcMain, app, BrowserWindow} = require('electron')
// Module to control application life.
const path = require('path')
const url = require('url')
const m = require('./app/script/menu')
const c = require('./app/script/connect')
const config = require('./app/script/configStore')
const redis=require('redis')
require('./app/script/event')
ipcMain.on('close-main-window', function () {
    app.quit();
});
clients=[]
cs=[]
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
mainWindow = null
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800, height: 600,
        show:false,
        "icon":__dirname + '/app/img/icon.png'
    })
    const template = [
        {
            label: '连接',
            submenu: [
                {
                    label: '新建连接',
                    click: m.createConnectWindow
                },
            ]
        }, {
            label: 'help',
            submenu: [
                {role: 'toggledevtools'},
                {role:'reload'}
            ]

        }

    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/app/index.html'),
        protocol: 'file:',
        slashes: true
    }))
    process.on('uncaughtexception',(err)=>{
        console.log(err)
        console.log('uncaught')
    })
    let r=config.getConnections()
    r.forEach(function (d) {
        clients.push({data:d})
        cs.push({})
    })
    mainWindow.webContents.send('load_connect')
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
    mainWindow.on('ready-to-show',()=>{mainWindow.show()})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

