/**
 * Created by xudas on 2017/8/11.
 */
const redis=require('redis')
function connect(data) {
    let client=redis.createClient(data)
    console.log(client)
}
