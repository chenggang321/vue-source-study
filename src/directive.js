/**
 * Created by HH_Girl on 2018/4/26.
 */
var Directives = require('./directives'),
    Filters = require('./filters');

var KEY_RE = /^[^\|]+/,
    FILTERS_RE = /\|[^\|]+/g;

function Directive(def, attr, arg, key) {
    if (typeof def === 'function') {
        this._update = def;
    } else {
        for (var prop in def) {
            if (prop === 'update') {
                this['_update'] = def.update;
                continue
            }
            this[prop] = def[prop]
        }
    }
    this.attr = attr;
    this.arg = arg;
    this.key = key;
    var filters = attr.value.match(FILTERS_RE);
    if (filters) {
        this.filters = filters.map(function (filter) {
            // TODO test performance against regex 对正则表达式测试性能
            var tokens = filter.replace('|', '').trim().split(/\s+/);
            return {
                apply: Filters[tokens[0]],
                args: tokens.length > 1 ? tokens.slice(1) : null
            }
        })
    }
}
Directive.prototype.update = function (value) {
    if (this.filters) {
        value = this.applyFilters(value)
    }
    this._update(value);
};

Directive.prototype.applyFilters = function (value) {
    var filtered = value;
    this.filters.forEach(function (filter) {
        if(typeof filter === 'function'){
            filtered = filter.apply(filtered, filter.args);
        }
    });
    return filtered;
};

module.exports = {
    // make sure the directive and value is valid
    parse: function (attr, prefix) {
        if (attr.name.indexOf(prefix) === -1) return null;
        // parse directive name and argument 解析指令名称和参数
        var noprefix = attr.name.slice(prefix.length + 1),//去除开头标记
            argIndex = noprefix.indexOf('-'),//是否还有-
            arg = argIndex === -1
                ? null
                : noprefix.slice(argIndex + 1),//第二个-后面的参数
            name = arg
                ? noprefix.slice(0, argIndex)
                : noprefix,//指令名称
            def = Directives[name];//指令回调
        var key = attr.value.match(KEY_RE);//获得|前面的值

        return def && key
            ? new Directive(def, attr, arg, key[0].trim())
            : null
    }
};