var prefix = 'sd',
    Filters     = require('./filters'),
    Directives  = require('./directives'),
    selector = Object.keys(Directives).map(function(d){
        return '['+prefix+'-'+d+']'
    }).join();//[sd-text],[sd-show],[sd-changeClass],[sd-on]

function Seed(opts){
    var self = this,
        root = this.el =document.getElementById(opts.id),
        els = root.querySelectorAll(selector),
        bindings = {};//内部真实数据
    self.scope = {};//外部接口
    //绑定指令
    [].forEach.call(els,processNode);

    function processNode(el){
        cloneAttributes(el.attributes).forEach(function(attr){
            var directive = parseDirective(attr);
        });
    }
}

//clone 属性 不改变原属性
function cloneAttributes(attributes){
    return [].map.call(attributes,function(attr){
        return {
            name:attr.name,
            value:attr.value
        }
    })
}
//解析dom中的指令
function parseDirective(attr){
    if(attr.name.indexOf(prefix) === -1) return ;
    var noprefix = attr.name.slice(prefix.length + 1),//去除开头标记
        argIndex = noprefix.indexOf('-'),//是否还有-
        dirname = argIndex === -1
            ? noprefix
            :noprefix.slice(0,argIndex),//指令名称
        def = Directives[dirname],//指令回调
        arg = argIndex === -1
            ? null
            : noprefix.slice(argIndex + 1);//第二个-后面的参数
    var exp = attr.value,
        pipeIndex = exp.indexOf('|'),
        key = pipeIndex === -1
            ? exp.trim()
            : exp.slice(0,pipeIndex).trim(),
        filters = pipeIndex === -1
            ? null
            : exp.slice(pipeIndex+1).split('|').map(function(filter){
                return filter.trim();
            });
    console.log(exp,pipeIndex,key,filters);
}

var app = new Seed({
    id: 'test',
    // template
    scope: {
        msg: 'hello',
        hello: 'WHWHWHW',
        changeMessage: function () {
            app.scope.msg = 'hola'
        }
    }
});


module.exports = {
    create:function(opts){
        return new Seed(opts)
    },
    filters:Filters,
    directives:Directives
};


