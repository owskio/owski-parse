//url/query string
//xml csv
//xpath/cssquery
var
expose = require('owski-expose'),
curry = require('owski-curry').curry,
eyes = require('eyes'),
K = require('owski-primitives').K,

parser = curry(function(defn,onSuccess,input){
  var
  parsed = defn(input);
  if (parsed) {
    var
    consumed = parsed && parsed.length,
    remainder = input.slice(consumed),
    nextParser = onSuccess(parsed);
    return nextParser && nextParser(remainder);
  }
}),
char = parser(function(input){
  var
  first = input[0] || '',
  arr = first.match(/^\w/);
  return arr && arr[0];
}),
// many = function(someParser){
//   return someParser(function(match){
//     return function(input){
//       var
//       rest = many(someParser)(input);
//       return rest
//        ? [match].concat(rest)
//        : [match];
//     };
//   });
// },
many = curry(function(someParser,onSuccess){
  var result = many1(someParser,function(matches){

  });
  console.log('result: ',result);
  return result
  || onSuccess([]);
}),
many1 = curry(function(someParser,onSuccess){
  return someParser(function(match){
    console.log('match: ',match);
    return many(someParser,function(matches){
      console.log('matches: ',matches);
      return K([match].concat(matches));
      // return matches.length
      //   ? onSuccess([match].concat(matches))
      //   : K([match]);
    });
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
eyes.inspect(many(char,function(x){return K(x);})('git://www.google.com'));
