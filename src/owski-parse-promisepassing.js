
var
eyes = require('eyes'),
Promise = require('owski-promise'),
curry = require('owski-curry').curry,

parser = curry(function(parse,then,input){
  var thisParser = Promise();
  var cont = thisParser.then(function(input){
    var
    parsed = parse(input),
    consumed = parsed.length,
    remainder = input.slice(consumed);
    nextParser = then(parsed);

    setTimeout(function(){
      nextParser.resolve(remainder);
    },0);

    return nextParser;
  });
  thisParser.resolve(input);
  return cont;
}),
retern = function(thing){
  return Promise(thing);
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
  return host(function(host){
    return retern({pro: pro, host: host});
  });
});

eyes.inspect(
  proHost('http://www.google.com')
);
