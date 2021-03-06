/**
 * Created by xudas on 2017/8/8.
 */
const {ipcRenderer, remote} = require('electron');
clients = remote.getGlobal('clients');
cs = remote.getGlobal('cs');
date=new Date()
function getTime() {
    let h=date.getHours()
    let m=date.getMinutes()
    return (h.length===1?'0':'')+h+':'+(m.length===1?'0':'')+m
}
class Node {
    constructor(text, type, valueType, pos = 0, end = false) {
        this.text = text;
        this.type = type;
        this.valueType = valueType;
        this.nodes = [];
        this.open = false;
        this.selected = false;
        this.pos = pos;
        this.data = {};
        this.no = '';
        this.loaded = false
        this.end = end
        this.status = 'hidden'
        this.mes=''
    }
    loadStart(){
        this.status = 'icon-spinner'
        this.mes='正在加载中'
        $(function () {
            $('[data-toggle=tooltip]').tooltip();
        });
    }
    loadEnd(){
        this.loaded=true
        this.open=true
        this.status = 'icon-ok'
        this.mes='加载于'+getTime()
        $(function () {
            $('[data-toggle=tooltip]').tooltip();
        });
    }
    clearSelect() {
        this.selected = false;
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clearSelect();
        }
    }

    select() {
        tree.clearSelect(this.pos);
        this.selected = true;
    }
}

NODE_TYPE = {
    CONNECTION: 1,
    DATABASE: 2,
    NAMESPACE: 3,
    KEY: 4
};
VALUE_TYPE = {

    zset: "sorted set",
    string: "string",
    set: "set",
    list: "list",
    hash: "hash",
};
Vue.component('s-input', {
    props: ['attr'],
    template: `<div class="input-group">
                        <span class="input-group-addon">{{attr.info}}</span>
                        <input :type="attr.inputType" class="form-control" :value="attr.value" v-model="attr.inputValue">
                        <span class="input-group-btn">
                            <button class="btn btn-default" v-on:click="attr.click" type="button"><i class="icon-arrow-right"></i></button>
                        </span>
                    </div>`
})
Vue.component('tr-item', {
    props: ['res', 'index', 'type'],
    template: `
<tr>
    <td>{{getIndex()}}</td>
    <td v-for="v in res">{{typeof v==='string'?"'"+v+"'":v}}</td>
</tr>`,
    methods: {
        getIndex: function () {
            return this.index + (page.cursor - 1) * page.pageSize;
        }
    }
});
Vue.component('tree-item', {
    props: ['node'],
    methods: {
        click: function (event) {
            if (this.node.type === NODE_TYPE.KEY) {
                this.select()
            }
        },
        spanClick: function (event) {
            if (this.node.loaded)
                switch (this.node.type) {
                    case NODE_TYPE.CONNECTION:
                    case NODE_TYPE.NAMESPACE:
                        this.node.open = !this.node.open;
                        break;
                    case NODE_TYPE.DATABASE:
                        this.node.open = !this.node.open;
                        break;
                    case NODE_TYPE.KEY:
                        this.select();
                        break
                } else {
                this.dbclick()
            }
        },
        dbclick: function (event) {
            switch (this.node.type) {
                case NODE_TYPE.CONNECTION:
                    if (cs[this.node.pos] != ({}).toString()) {
                        reloadDatabase(this.node);
                        this.node.open = true;
                    } else {
                        ipcRenderer.send('connect', this.node.pos);
                    }
                    break;
                case NODE_TYPE.NAMESPACE:
                    reloadNamespace(this.node);
                    break;
                case NODE_TYPE.DATABASE:
                    reloadKeys(this.node);
                    break;
                case NODE_TYPE.KEY:
                    this.select();
                    break
            }
        },
        select: function (s = true) {
            tree.selectedNode = this.node;
            this.node.select();
            if (s) show(this.node, table, info, page)
        }
    },
    template: `<div >
                    <p :class="['tree-item-text', {selected:node.selected},'node-'+node.type.toString()]" v-on:dblclick.stop="dbclick" v-on:click="click">
                    <span :class="['glyphicon',{'glyphicon-menu-right':node.end},node.open?'glyphicon-minus':'glyphicon-plus']"
                        aria-hidden="true"style="margin-right: 5px" v-on:click="spanClick"></span>
                    {{node.text}}<span :class="['glyphicon ',node.status]"aria-hidden="true"style="margin-top:5px;float:right"
                    data-placement="right" data-toggle="tooltip" :data-original-title="node.mes"></span></p>
                       <tree-item
                          v-if="node.open"
                          v-for="item in node.nodes"
                          v-bind:node="item"
                          v-bind:key="item.text">
                       </tree-item>
                </div>`
});
var tree = new Vue({
    el: '#tree',
    data: {
        nodes: [],
        selectedNode: null
    },
    methods: {
        clearSelect: function (pos) {
            this.nodes[pos].clearSelect()
        }
    }
});
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
        type: VALUE_TYPE.string
    },
    methods: {
        refresh: function () {
            let cur = parseInt(this.inputCursor);
            let pag = parseInt(this.inputPageSize);
            if (pag >= 0) {
                this.pageSize = pag
            }
            if (cur <= this.pageCount && cur > 0) {
                this.cursor = cur
            }
            show(tree.selectedNode, table, info, page)
        },
        clear: function () {
            this.pageCount = null;
            this.cursor = 1;
        },
    }
});
var table = new Vue({
    el: '#table',
    data: {
        result: [],
        headers: []
    }
});
var info = new Vue({
    el: '#info',
    data: {
        key: null,
        show: false,
        type: null,
        length: null,
        rename: false,
    }
});

function freshArray(a, b) {
    Vue.set(a, b, a[b])
}

clients = remote.getGlobal('clients');
for (let i = 0; i < clients.length; i++) {
    if (tree.nodes[i] !== null && tree.nodes[i] !== undefined) {
        tree.nodes[i].data = clients[i].data;
        tree.nodes[i].text = clients[i].data.name;
        freshArray(tree.nodes, i)
    } else {
        tree.nodes.push(new Node(clients[i].data.name, NODE_TYPE.CONNECTION, '', i))
    }
}
ipcRenderer.on('load_connect', function (event) {
    clients = remote.getGlobal('clients');
    for (let i = 0; i < clients.length; i++) {
        tree.nodes[i] = new Node(clients[i].data.name, NODE_TYPE.CONNECTION);
        freshArray(tree.nodes, i)
    }
});
ipcRenderer.on('add_connect_success', function (event, i) {
    clients = remote.getGlobal('clients');
    tree.nodes[i] = new Node(clients[i].data.name, NODE_TYPE.CONNECTION, i);
    freshArray(tree.nodes, i)
});
ipcRenderer.on('connect_success', function (event, pos) {
    cs = remote.getGlobal('cs')
    reloadDatabase(tree.nodes[pos]);
    freshArray(tree.nodes, pos)
});
