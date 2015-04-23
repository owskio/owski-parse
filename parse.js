//url/query string
//xml
//csv
//xpath/cssquery
var
expose = require('owski-expose'),
curry = require('owski-curry').curry,
eyes = require('eyes'),
K = require('owski-primitives').K,

// bind = function(p,f){
//   return function(input){
//     p()
//   };
// },
parser = curry(function(defn,onSuccess,input){
  var
  parsed = defn(input);
  //console.log('parsed: ',parsed);
  if (parsed) {
    var
    consumed = parsed.length,
    remainder = input.slice(consumed);
    //console.log('parsed,remainder : ',parsed,'|',remainder);
    //console.log('onSuccess(parsed,remainder): ',onSuccess(parsed,remainder));
    return onSuccess(parsed,remainder)(remainder);
  }
}),
char = parser(function(input){
  var
  first = input[0] || '',
  arr = first.match(/^\w/);
  return arr && arr[0];
}),
many = function(someParser){
  return someParser(function(match){
    // console.log('match: ',match);
    return function(input){
      var
      rest = many(someParser)(input);
      return rest
       ? [match].concat(rest)
       : [match];
    };
    // (function(matches){
    //   console.log('matches: ',matches);
    //   return K([match].concat(matches));
    // });
  });
},
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
// proHost('http://www.google.com') === {
//   pro:'http',host:'www.google.com'
// };
eyes.inspect(proHost('http://www.google.com'));
eyes.inspect(many(char)('git://www.google.com'));
// expose(module,{
//
// });
