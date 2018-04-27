var config = require('./config'),
    Seed = require('./seed'),
    directives   = require('./directives'),
    filters  = require('./filters');

Seed.config = config;

Seed.extend = function(opts){
    var Spore = function(){
        Seed.apply(this,arguments);
        for(var prop in this.extensions){
            var ext = this.exception[prop];
            this.scope[prop] = (typeof ext === 'function')
                ? ext.bind(this)
                : ext
        }
    };
    Spore.prototype = Object.create(Seed.prototype);
    Spore.prototype.exception = {};
    for(var prop in opts){
        Spore.prototype.exception[prop] = opts[prop];
    }
    return Spore
};

Seed.directive = function (name,fn){
    directives[name] = fn;
};

Seed.filter =function(name,fn){
    filters[name] = fn;
};

Seed.filter('money', function (value) {
    return '$' + value.toFixed(2)
});

var list = [
    {
        title: 'make this shit kinda work',
        done: true
    },
    {
        title: 'make this shit work',
        done: false
    },
    {
        title: 'more features!!!',
        done: false
    }
];

var s = Date.now();

var todos = new Seed('#test', {
    total     : Math.random() * 100000,
    'msg.wow' : 'wow',
    hello     : 'hello',
    todos     : list,
    changeMessage: function () {
        this.scope['msg.wow'] = 'holaoooo'
    },
    remove: function () {
        this.destroy()
    }
});

console.log(Date.now() - s + 'ms');
module.exports = Seed;