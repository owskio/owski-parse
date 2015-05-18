
var
eyes = require('eyes'),
p = require('owski-promise'),
Promise = p.Promise,
curry = require('owski-curry').curry,
K = require('owski-primitives').K,
l = function(){
  console.log.apply(this,arguments);
},

parser = curry(function(parse,back,input){
  var here = Promise();
  var there = here.then(function(input){
    var result = parse(input);
    var rest = input.slice(result.length);
    var whatever = back(result)(rest);
    setTimeout(function(){
      whatever.resolveWith(rest);
    },0);
    return whatever;
  });
  here.resolveWith(input);
  return there;
}),
retern = function(z){
  return function(){
    return Promise(z);
  };
},

protocol = parser(function(input){
  var arr = input.match(/^[^:]+/);
  return arr && arr[0];
}),
host = parser(function(input){
  var arr = input.match(/[\w.]+/);
  return arr && arr[0];
}),
proHost = protocol(function(pro){
  console.log('pro: ',pro);
  return host(function(host){
    console.log('host: ',host);
    return retern({retPro: pro, retHost: host});
  });
});
var result = proHost('http://www.google.com')
.then(function(x){
  console.log('Final Result:');
  eyes.inspect(x);
});
