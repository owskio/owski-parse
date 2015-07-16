
var
expose = require('owski-expose'),
curry = require('owski-curry').curry,
eyes = require('eyes'),
primitives = require('owski-primitives'),
K = primitives.K,
I = primitives.I,
undefined = primitives.undefined,
compose = require('owski-apply').compose,
p = require('owski-promise'),
Promise = p.Promise,


retern = function(z){
  console.log('z: ',z);
  return function(input){
    console.log('returning Promise(z)');
    return Promise(z);
  };
},
parser = curry(function(parse,back,input){
  var block = Promise();
  setTimeout(function(){
    block.resolveWith(input);
  },0);
  return block.then(function(input){
    var
    result = parse(input),
    consumed = result ? result.length : 0,
    rest = input.slice(consumed),
    maybeNextParser =  back(result),
    nextParser = maybeNextParser || retern(undefined);
    return nextParser(rest);
  });
}),
regexParser = function(pattern){
  return parser(function(input){
    var
    arr = input.match(pattern);
    return arr && arr[0];
  });
},
rexWord = regexParser(/^\w+/),
whitespace = regexParser(/^[\s\r\n]+/),
space = regexParser(/^\s/),
digits = regexParser(/^\d+/),

many = curry(function(someParser,then){
  return someParser(function(match){
    //console.log('match:',match);
    return match
    ? many(someParser,function(matches){
      return then([match].concat(matches));
    })
    : then([]);
  });
}),
separatedBy = curry(function(separatorParser,someParser,then){
  //Discard the result of the first parser, keep second
  console.log('sep by arguments: \n',arguments);
  var
  discardParser = compose(separatorParser,K,someParser);
  //Take the first, then treat the rest as many (junk,gold) pairs
  return someParser(function(match){
    console.log('sep_match: ',match);
    return many(discardParser,function(matches){
      console.log('sep_matches: ',matches );
      return then([match].concat(matches));
    });
  });
}),
blahs = separatedBy(whitespace,rexWord),

// obj = function(then){
//   return digits(function(ds){
//   return space( function(s){
//   console.log('1: ');
//   return blahs( function(bs){
//     console.log('2: ');
//     console.log('ds: ',ds);
//     return then(bs);
//   });});});
// },

obj = function(then){
  return digits(function(ds){
  return space( function(s){
    console.log('1: ');
    return blahs(then);
  });});
},

// obj = digits(function(ds){
//   return space( function(s){
//     console.log('1: ');
//     return blahs;
//   });}),
z;
// obj = digits(function(ds){
//   return space( function(s){
//   console.log('1: ');
//   return blahs( function(bs){
//     console.log('2: ');
//     console.log('ds: ',ds);
//     return retern(bs);
//   });});
// }),


console.log('obj: ',obj);
var testObj = obj(function(){
  console.log('Arguments: ',arguments);
});
console.log(testObj);
var
promiseMaybe = obj(function(p){
  console.log('simple: ');
  eyes.inspect(p);
  console.log('simple - 1');
  return retern(p);
});
console.log('promiseMaybe: ',promiseMaybe);
var
promise = promiseMaybe('9876 asdf qwer poiu lkjh');

promise.then(function(x){
  console.log('simple - 2');
  eyes.inspect(x);
  console.log('simple - 3');
});
