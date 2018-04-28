var config = require('./config'),
    controllers = require('./controllers'),
    bindingParse = require('./binding');

var map = Array.prototype.map;
var each = Array.prototype.forEach;

//lazy init

var ctrlAttr,
    eachAttr;

function Seed(el, data, options) {

    //refresh
    ctrlAttr = config.prefix + '-controller';
    eachAttr = config.prefix + '-each';

    if (typeof el === 'string') {
        el = document.querySelector(el);
    }

    this.el = el;
    this.scope = data;//外部数据
    this._bindings = {};//内部数据
    this._options = options || {};//配置

    //复制一份传入的数据
    var key,dataCopy = {};
    for(key in data){
        dataCopy[key] = data[key];
    }

    // if has controller
    var ctrlId = el.getAttribute(ctrlAttr);
    var controller = null;

    if(ctrlId){
        controller = controllers[ctrlId];
        el.removeAttribute(ctrlAttr);
        if(!controller){
            throw new Error('controller'+ctrlId+'is not defined');
        }
    }

    // process nodes for directives
    this._compileNode(el,true);

    //copy in methods from controller
    if(controller){
        controller.call(null,this.scope,this);
    }

    // initialize all variables by invoking setters
    for (var key in dataCopy) {
        this.scope[key] = dataCopy[key]
    }
}

Seed.prototype._compileNode = function (node,root) {
    var self = this;

    if (node.nodeType === 3) {
        //text node 对文字节点编译
        self._compileTextNode(node);
    } else if (node.attributes && node.attributes.length) {//对元素节点操作
        var eachExp = node.getAttribute(eachAttr);// sd-each 的值
        var ctrlExp = node.getAttribute(ctrlAttr);// sd-controller 的值

        // 对 sd-each 元素操作
        if(eachExp){
            //each block
            /*
            * @param selector sd-each元素
            * @out Binding {bind: ƒ, _update: ƒ, mutate: ƒ, buildItem: ƒ, key: "todos", …} 
            *
            * 绑定的元素
            * */
            var binding = bindingParse.parse(eachAttr,eachExp);
            if(binding){
                /*
                * 将binding 绑定到 node 上并存到
                * */
                self._bind(node,binding);
            }
        }else if(!ctrlExp || root){//skip nested controllers
            //normal node
            //clone attributes because the list can change
            var attrs = map.call(node.attributes,function(attr){
                return {
                    name:attr.name,
                    extensions:attr.value.split(',')
                }
            });

            attrs.forEach(function(attr){
                var valid = false;
                attr.extensions.forEach(function(exp){
                    var binding = bindingParse.parse(attr.name,exp);
                    if(binding){
                        valid = true;
                        self._bind(node,binding);
                    }
                });
                if(valid) node.removeAttribute(attr.name);
            });
            // 通过递归遍历所有子元素
            if(node.childNodes.length){
                each.call(node.childNodes,function(child){
                    self._compileNode(child);
                })
            }
        }
    }

};

Seed.prototype._compileTextNode = function(node){
    return node
};

Seed.prototype._bind = function (node, bindingInstance) {

    bindingInstance.seed = this;//将这个实例存入 binding
    bindingInstance.el = node;

    var key = bindingInstance.key,
        epr = this._options.eachPrefixRE,
        isEachKey = epr && epr.test(key),
        seed = this;
    // TODO make scope chain work on nested controllers
    if(isEachKey){
        key = key.replace(epr,'');
    }else if (epr){
        seed = this._options.parentSeed;
    }

    //生成binding 并加入 bindings 同时通过属性劫持 与 scope 绑定
    var binding = seed._bindings[key] || seed._createBinding(key);
    // add directive to this binding
    binding.instance.push(bindingInstance);


    // invoke bind hook if exists
    if (bindingInstance.bind) {
        bindingInstance.bind.call(bindingInstance);
    }

};

Seed.prototype._createBinding = function (key) {
    var binding = {
        value: undefined,
        instance: []
    };
    this._bindings[key] = binding;

    // bind accessor triggers to scope
    Object.defineProperty(this.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value;
            binding.instance.forEach(function (instance) {
                instance.update(value)
            })
        }
    });

    return binding
};

Seed.prototype.dump = function () {
    var data = {};
    for (var key in this._bindings) {
        data[key] = this._bindings[key].value
    }
    return data
}

Seed.prototype.destroy = function () {
    for (var key in this._bindings) {
        this._bindings[key].instance.forEach(unbind);
        delete this._bindings[key];
    }
    this.el.parentNode.removeChild(this.el);
    function unbind(instance) {
        if (instance.unbind) {
            instance.unbind()
        }
    }
};

module.exports = Seed;
