/**
 * Created by HH_Girl on 2018/4/25.
 */
module.exports = {
    text:function(el,value){
        el.textContent = value || ''
    },
    show:function(el,value){
        el.style.display = value? '':'none'
    },
    changeClass:function(el,value,classname){
        el.classList[value ? 'add' : 'remove'](classname)
    },
    on:{//directive 指令
        update:function(el,handler,event,directive){
            if(!directive.handlers){
                directive.handlers = {}
            }
            var handlers = directive.handlers;
            if(handlers[event]){
                el.removeEventListener(event,handlers[event])
            }
            if(handler){
                handler = handler.bind(el);
                el.addEventListener(event,handler);
                handlers[event] = handler;
            }
        },
        unbind:function(el,event,directive){
            if(directive.handlers){
                el.removeEventListener(event,directive.handlers[event])
            }
        },
        customFilter:function(handler,selectors){
            return function(e){
                var match = selectors.every(function(selector){
                    return e.target.webkitMatchesSelector(selector)
                });
                if(match) handler.apply(this,arguments);
            }
        }
    }
};