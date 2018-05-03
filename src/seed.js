var config = require('./config'),
    controllers = require('./controllers'),
    DirectiveParser = require('./directive-parser');

var slice = Array.prototype.slice;

var ancestorKeyRE = /\^/g,
    rootKeyRE = /^\$/,
    ctrlAttr = config.prefix +'-controller',
    eachAttr = config.prefix + '-each';

function Seed(el, options) {
    if (typeof el === 'string') {
        el = document.querySelector(el);
    }

    el.seed =this;
    this.el = el;
    this._bindings = {};//内部数据

    if (options) {
        for(var op in options){
            this[op] = options[op];
        }
    }

    //initialize the scope object
    var dataPrefix = config.prefix + '-data';
    this.scope =
        (options && options.data)
        || config.datum[el.getAttribute(dataPrefix)]
        || {};

    el.removeAttribute(dataPrefix);

    // if has controller
    var ctrlId = el.getAttribute(ctrlAttr);
    var controller = null;

    if(ctrlId){
        controller = config.controllers[ctrlId];
        if(!controller) console.warn('controller'+ctrlId+'is not defined');
        el.removeAttribute(ctrlAttr);
    }

    // process nodes for directives
    this._compileNode(el,true);

    //copy in methods from controller
    if(controller){
        controller.call(this,this.scope,this);
    }
}
//Emitter(Seed.prototype)
Seed.prototype._compileNode = function (node,root) {
    var self = this;
    if (node.nodeType === 3) {
        //text node 对文字节点编译
        self._compileTextNode(node);
    } else{
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
            var binding = DirectiveParser.parse(eachAttr,eachExp);
            if(binding){
                /*
                * 将binding 绑定到 node 上并存到
                * */
                self._bind(node,binding);
            }
        }else if(ctrlExp && !root) {//nested controllers
            var id=node.id,
                seed = new Seed(node,{
                    parentSeed:self
                });
            if(id){
                self['$'+id]=seed;
            }
        }else if(node.attributes && node.attributes.length){//normal node
            //normal node
            //clone attributes because the list can change

            slice.call(node.attributes).forEach(function(attr){
                var valid = false;
                attr.value.split(',').forEach(function(exp){
                    var binding = DirectiveParser.parse(attr.name,exp);
                    if(binding){
                        valid = true;
                        self._bind(node,binding);
                    }
                });
                if(valid) node.removeAttribute(attr.name);
            });
        }
        if(!eachExp && !ctrlExp){
            // 通过递归遍历所有子元素
            if(node.childNodes.length){
                slice.call(node.childNodes).forEach(function(child){
                    self._compileNode(child);
                })
            }
        }
    }

};

Seed.prototype._compileTextNode = function(node){
    return node
};

Seed.prototype._bind = function (node, directive) {

    directive.seed = this;//将这个实例存入 binding
    directive.el = node;

    var key = directive.key,
        epr = this.eachPrefixRE,
        isEachKey = epr && epr.test(key),
        scopeOwner = this;


    if(isEachKey){
        key = key.replace(epr,'');
    }

    //handle scope nesting
    if(epr&&!isEachKey){
        scopeOwner =this.parentSeed;
    }else{
        var ancestors = key.match(ancestorKeyRE),
            root = key.match(rootKeyRE);
        if(ancestors){
            key = key.replace(ancestorKeyRE,'');
            var levels = ancestors.length;
            while (scopeOwner.parentSeed && levels--){
                scopeOwner = scopeOwner.parentSeed;
            }
        }else if(root){
            key = key.replace(rootKeyRE,'');
            while (scopeOwner.parentSeed){
                scopeOwner = scopeOwner.parentSeed;
            }
        }
    }

    directive.key = key;

    //生成binding 并加入 bindings 同时通过属性劫持 与 scope 绑定
    var binding = scopeOwner._bindings[key] || scopeOwner._createBinding(key);
    // add directive to this binding
    binding.instance.push(directive);


    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(binding.value);//*** directive
    }

    //set initial value
    if(binding.value){
        directive.update(binding.value)
    }

};

Seed.prototype._createBinding = function (key) {
    var binding = {
        value: this.scope[key],
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
