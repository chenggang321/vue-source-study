var config = require('./config'),
    Seed = require('./seed'),
    directives   = require('./directives'),
    filters  = require('./filters');

function buildSelector(){
    config.selector = Object.keys(directives).map(function (directive) {
        return '[' + config.prefix + '-' + directive + ']'
    }).join()
}

Seed.config = config;
buildSelector();

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
    buildSelector();
};

Seed.filter =function(name,fn){
    filters[name] = fn;
};

Seed.filter('money', function (value) {
    return '$' + value.toFixed(2)
})



// define a seed
var Todos = Seed.extend({
    id: 0,
    changeMessage: function () {
        this.scope['msg.wow'] = 'hola'
    },
    remove: function () {
        this.destroy()
    }
})

var todos = new Todos('#test', {
    total     : 1000,
    'msg.wow' : 'wow',
    hello     : 'hello',
    todos     : [
        {
            title: 'make this shit work',
            done: false
        },
        {
            title: 'make this shit kinda work',
            done: true
        }
    ]
});

console.log(todos);

module.exports = Seed;


