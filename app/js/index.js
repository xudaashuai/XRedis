/**
 * Created by xudas on 2017/8/8.
 */
const {ipcRenderer, remote} = require('electron')
class Node {
    constructor(text, type, valueType) {
        this.text = text
        this.type = type
        this.valueType = valueType
        this.nodes = []
        this.open = false
        this.selected = false;
    }

    clearSelect() {
        this.selected = false;
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clearSelect();
        }
    }

    select() {
        tree.clearSelect();
        this.selected = true;
    }
}
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
        click:function (event) {
            if(this.node.type === NODE_TYPE.KEY){
                this.select()
            }
        },
        spanClick: function (event) {
            switch (this.node.type) {
                case NODE_TYPE.CONNECTION:
                case NODE_TYPE.NAMESPACE:
                    this.node.open = !this.node.open
                    break
                case NODE_TYPE.DATABASE:
                    this.node.open = !this.node.open
                    break
                case NODE_TYPE.KEY:
                    this.select()
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
                    this.select()
                    break
            }
        },
        select: function () {
            tree.selectedNode = this.node
            this.node.select();
            show(this.node, table, info, page)
        }
    },
    template: `<div>
                            <p :class="'tree-item-text '+(node.selected?'selected ':'')+('node-'+node.type.toString())" v-on:dblclick="dbclick" v-on:click="click" >
                            <span :class="node.end?'glyphicon glyphicon-menu-right':node.open?'glyphicon glyphicon-minus':'glyphicon glyphicon-plus'"
                                aria-hidden="true"style="margin-right: 5px" v-on:click.stop="spanClick"></span>
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
        node: new Node('新建连接', NODE_TYPE.CONNECTION),
        selectedNode: null
    },
    methods: {
        clearSelect: function () {
            this.node.clearSelect()
        }
    }
})

var page = new Vue({
    el: "#page-control",
    data: {
        pageCount: 100,
        cursor: 1,
        inputCursor: 1,
        addable: false,
        show: false,
        pageSize: 100,
        inputPageSize: 100,
        type:VALUE_TYPE.string
    },
    methods: {
        refresh: function () {
            let cur = parseInt(this.inputCursor)
            let pag = parseInt(this.inputPageSize)
            if (pag >= 0) {
                this.pageSize = pag
            }
            if ( cur <= this.pageCount && cur > 0) {
                this.cursor=cur
            }
            show(tree.selectedNode, table, info, page)
        },
        clear: function () {
            this.pageCount = null;
            this.cursor = 1;
        },
    }
})
Vue.component('tr-item', {
    props: ['res', 'index','type'],
    template: `
<tr v-if=" type !=='hash'">
    <td>{{getIndex()}}</td>
    <td>{{typeof res==='string'?"'"+res+"'":res}}</td>
</tr>
<tr v-else>
    <td>{{getIndex()}}</td>
    <td>{{typeof res[0]==='string'?"'"+res[0]+"'":res[0]}}</td>
    <td>{{typeof res[1]==='string'?"'"+res[1]+"'":res[1]}}</td>
</tr>`,
    methods: {
        getIndex: function () {
            return this.index + (page.cursor - 1) * page.pageSize;
        }
    }
})
var table = new Vue({
    el: '#table',
    data: {
        result: [null]
    }
})
var info = new Vue({
    el: '#info',
    data: {
        key: null,
        show: false,
        type: null,
        length: null,
        rename: false,
    }
})
ipcRenderer.on('load_client', function (event) {
    console.log('get load')
    client = remote.getGlobal('client')
    client.dbsize([], (err, mes) => {
        console.log(mes)
    })
    tree.node = new Node('新建连接', NODE_TYPE.CONNECTION)
    reloadDatabase(tree.node)
})
ipcRenderer.sendSync('connect', {
    name: "",
    host: "101.236.6.203",
    port: "6379",
})