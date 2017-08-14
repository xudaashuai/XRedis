/**
 * Created by xudas on 2017/8/14.
 */
const redis=require('redis')
exports.connect=function (data,pos) {
    client = redis.createClient(data.port, data.host,'pass' in data? {auth_pass: data.pass}:{})
    client.on("error", function (err) {
        console.log("Error happen on" + data.name + err);
    });
    client.on('ready',function () {
        for(let i=0;i<clients.length;i++){
            if (cs[i]===null ||cs[i] ===undefined){
                cs[i]={}
            }
        }
        cs[pos]=client
        mainWindow.webContents.send('connect_success',pos)
    })
}