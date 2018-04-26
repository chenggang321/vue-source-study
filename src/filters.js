/**
 * Created by HH_Girl on 2018/4/25.
 */
module.exports = {
    capitalize:function(value){
        value = value.toString();
        return value.charAt(0).toUpperCase()+value.slice(1)
    }
};