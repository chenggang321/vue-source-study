var config = require('./config'),
    Seed = require('./seed'),
    directives = require('./directives'),
    filters = require('./filters');

var controllers = config.controllers = {},
    datum = config.datum = {},
    api = {};

//API

api.data = function(id,data){
  if(!data) return datum[id];
  if(datum[id]){
      console.warn('data object "'+id+'""already exists has been overwritten')
  }
  datum[id] = data;
};

api.controller = function(id,extensions){
    if(!extensions) return controllers[id];
    if(controllers[id]){
        console.warn('controller "'+id+'""already exists has been overwritten')
    }
    controllers[id] = extensions;
};

api.directive = function (name, fn) {
    directives[name] = fn;
};

api.filter = function (name, fn) {
    filters[name] = fn;
};

api.bootstrap = function (opts) {
    if(opts){
        config.prefix = opts.prefix || config.prefix;
    }
    var app = {},
        n = 0,
        el, seed;
    while (el = document.querySelector('[' + config.prefix + '-controller]')) {
        seed = new Seed(el);
        if (el.id) {
            app['$' + el.id] = seed
        }
        n++
    }
    return n > 1 ? app : seed
};


/********************************  实例代码 **************************************/
var todos = [
    { text: 'make nesting controllers work', done: true },
    { text: 'complete ArrayWatcher', done: false },
    { text: 'computed properties', done: false },
    { text: 'parse textnodes', done: false }
];

api.data('test',{todos:todos});

api.controller('Todos', function (scope, seed) {

    // regular properties
    //scope.todos = todos;
    scope.filter = 'all';
    scope.remaining = scope.todos.reduce(function (count, todo) {
        return count + (todo.done ? 0 : 1)
    }, 0);

    // computed properties
    scope.total = function () {
        return scope.todos.length
    };

    scope.completed = function () {
        return scope.todos.length - scope.remaining
    };

    // event handlers
    scope.addTodo = function (e) {
        var text = e.el.value;
        if (text) {
            e.el.value = '';
            scope.todos.push({
                text: text,
                done: false
            });
            scope.remaining++
        }
    };

    scope.removeTodo = function (e) {
        scope.todos.splice(e.seed.index, 1);
        scope.remaining -= e.seed.scope.done ? 0 : 1
    };

    scope.toggleTodo = function (e) {
        scope.remaining += e.seed.scope.done ? -1 : 1
    };

    scope.setFilter = function (e) {
        scope.filter = e.el.className
    }

});
api.bootstrap();
/************************************ 实例代码 ***********************************/

module.exports = api;