var config = require('./config'),
    Seed = require('./seed'),
    directives = require('./directives'),
    filters = require('./filters'),
    controllers = require('./controllers');


Seed.config = config;

/*Seed.extend = function (opts) {
    var Spore = function () {
        Seed.apply(this, arguments);
        for (var prop in this.extensions) {
            var ext = this.exception[prop];
            this.scope[prop] = (typeof ext === 'function')
                ? ext.bind(this)
                : ext
        }
    };
    Spore.prototype = Object.create(Seed.prototype);
    Spore.prototype.exception = {};
    for (var prop in opts) {
        Spore.prototype.exception[prop] = opts[prop];
    }
    return Spore
};*/

Seed.controller = function (id, extensions) {
    if (controllers[id]) {
        console.warn('controller"' + id + '"was already and has been overwritten')
    }
    controllers[id] = extensions;
};

Seed.bootstrap = function (seeds) {
    console.log(seeds);
    if (!Array.isArray(seeds)) seeds = [seeds];
    var instances = [];
    seeds.forEach(function (seed) {
        var el = seed.el;
        if (typeof el === 'string') {
            el = document.querySelector(el);
        }
        if (!el) console.warn('invalid element or selector:' + seed.el);
        instances.push(new Seed(el, seed.data, seed.options));
    });
    return instances.length > 1
        ? instances
        : instances[0]
};

Seed.directive = function (name, fn) {
    directives[name] = fn;
};

Seed.filter = function (name, fn) {
    filters[name] = fn;
};
Seed.evolve = Seed.controller;
Seed.plant = Seed.bootstrap;

/********************************  实例代码 **************************************/
Seed.filter('money', function (value) {
    return value
        ? '$' + value.toFixed(2)
        : ''
});

Seed.controller('TodoList', function (scope, seed) {
    scope.changeMessage = function () {
        scope.msg = 'It works!'
    };
    scope.remove = function () {
        seed.destroy();
    }
});

Seed.controller('Todo', function (scope) {
    scope.toggle = function () {
        scope.done = !scope.done
    }
});

var s = Date.now();

var data = {
    msg: 'hello!',
    total: 9999,
    red: 'red',
    todos: [
        {
            title: 'hello!',
            done: true
        },
        {
            title: 'hello!!',
            done: false
        },
        {
            title: 'hello!!!',
            done: false
        }
    ]
};

var app = Seed.bootstrap({
    el:'#app',
    data:data
});

console.log(Date.now() - s + 'ms');

/************************************ 实例代码 ***********************************/

module.exports = Seed;