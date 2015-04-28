//url/query string
//xml csv
//xpath/cssquery
var
expose = require('owski-expose'),
curry = require('owski-curry').curry,
eyes = require('eyes'),
primitives = require('owski-primitives'),
K = primitives.K,
I = primitives.I,
undefined = primitives.undefined,
compose = require('owski-apply').compose,

parser = curry(function(parse,then,input){
  var
  parsed = parse(input),
  consumed = parsed ? parsed.length : 0,
  remainder = input.slice(consumed),
  nextParser = then(parsed) || K(undefined);
  return nextParser(remainder);
}),
// wordChar = parser(function(input){
//   var
//   arr = input.match(/^\w/);
//   return arr && arr[0];
// }),
regexp = function(pattern){
  return parser(function(input){
    var
    arr = input.match(pattern);
    return arr && arr[0];
  });
},
wordChar = regexp(/^\w/),
digit = regexp(/^\d/),
many = curry(function(someParser,then){
  return someParser(function(match){
    return match
    ? many(someParser,function(matches){
        return then([match].concat(matches));
      })
    : then([]);
  });
}),
protocol = parser(function(input){
  var arr = input.match(/^[^:]+/);
  return arr && arr[0];
}),
host = parser(function(input){
  var arr = input.match(/[\w.]+/);
  return arr && arr[0];
}),
proHost =
  protocol(function(pro){
    return host(function(host){
      return K({pro: pro, host: host});
    });
  });
eyes.inspect(proHost('http://www.google.com'));

expose(module,{
  many: many,
  wordChar: wordChar
});
