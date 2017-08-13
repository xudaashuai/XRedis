/**
 * Created by xudas on 2017/8/8.
 */
const {ipcRenderer,remote} = require('electron')
NODE_TYPE = {
    CONNECTION: 1,
    DATABASE: 2,
    NAMESPACE: 3,
    KEY: 4
}
VALUE_TYPE = {

    zset: "sorted set",
    string: "string",
    set: "set",
    list: "list",
    hash: "hash",
}
Vue.component('tree-item', {
    props: ['node'],
    methods: {
        click: function (event) {
            let items= document.querySelectorAll(".tree-item-text")
            for(let i =0;i<items.length;i++){
                items[i].select=false
            }

            switch (this.node.type) {
                case NODE_TYPE.CONNECTION:
                case NODE_TYPE.NAMESPACE:
                    this.node.open = !this.node.open
                    break
                case NODE_TYPE.DATABASE:
                    this.node.open = !this.node.open
                    break
            }
        },
        dbclick: function (event) {
            switch (this.node.type) {
                case NODE_TYPE.CONNECTION:
                    reloadDatabase(this.node)
                    this.node.open = true
                    break
                case NODE_TYPE.NAMESPACE:
                    reloadNamespace(this.node)
                    this.node.open = true
                    break
                case NODE_TYPE.DATABASE:
                    reloadKeys(this.node)
                    this.node.open = true
                    break
                case NODE_TYPE.KEY:
                    show(this.node,table,info,page)
                    break
            }
        }
    },
    template: `
                        <div>
                            <p class="tree-item-text" v-on:dblclick="dbclick" :style="'background-color:hsl(0,0%,'+(100-node.type*5).toString()+'%);'+'padding-left:'+(node.type*15).toString()+'px'">
                            <span :class="node.end?'glyphicon glyphicon-menu-right':node.open?'glyphicon glyphicon-minus':'glyphicon glyphicon-plus'"
                                aria-hidden="true"style="margin-right: 5px" v-on:click="click"></span>
                            {{node.text}}</p>
                               <tree-item
                                  v-if="node.open"
                                  v-for="item in node.nodes"
                                  v-bind:node="item"
                                  v-bind:key="item.id">
                                </tree-item>
                        </div>`
})
var tree = new Vue({
    el: '#root',
    data: {
        node: {
            text: '1',
            nodes: [],
            deep: 1,
            end: false,
            open: true,
            type: NODE_TYPE.CONNECTION
        }
    }
})
Vue.component('tr-item', {
    props: ['res','index'],
    template: `
            <tr><td>{{index}}</td><td>{{res===null?"'null'":typeof res==='string'?"'"+res+"'":res}}</td></tr>
            `
})
var table = new Vue({
    el: '#table',
    data: {
        result: [null]
    }
})
var info=new Vue({
    el:'#info',
    data:{
        key:null,
        show:false,
        type:null,
        length:null,
        rename:false
    }
})
ipcRenderer.on('load_client', function (event) {
    console.log('get load')
    client = remote.getGlobal('client')
    client.dbsize([], (err, mes) => {
        console.log(mes)
    })
    tree.node.text = '新建连接'
    tree.node.nodes = []
    reloadDatabase(tree.node)
})
ipcRenderer.sendSync('connect',{
    name:"",
    host:"101.236.6.203",
    port:"6379",
})
var page=new Vue({
    el:"#page-control",
    data:{
        pageCount:100,
        cursor:1,
        addable:false,
        show:false,
        pageSize:100
    },
    methods:{
        nextPage:function(){
            if (this.cursor<this.pageSum){
                this.cursor+=1;
            }
        },
        prePage:function () {

        },
        clear:function(){
            this.pageCount=null;
            this.cursor=1;
        }
    }
})