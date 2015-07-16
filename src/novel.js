


var
curry = require('owski-curry').curry,
eyes = require('eyes'),
primitives = require('owski-primitives'),
K = primitives.K,
I = primitives.I,
undefined = primitives.undefined,
compose = require('owski-apply').compose,

// create = function(Cons,proto){
//   Cons.prototype = proto;
//   return new Cons();
// },

parser = function(parse,input){
  var
  result = parse(input),
  consumed = result ? result.length : 0,
  rest = input.slice(consumed);
  return [{}];
},

retern = curry(function(z,input,back){
  console.log('returning Promise(z)');
  return back(z);
}),
parser = curry(function(parse,back,input){
  var
  result = parse(input),
  consumed = result ? result.length : 0,
  rest = input.slice(consumed),
  maybeNextParser =  back(result),
  nextParser = maybeNextParser || retern(undefined);
  return nextParser(rest);
}),
regexParser = function(pattern){
  return parser(function(input){
    var
    arr = input.match(pattern);
    return arr && arr[0];
  });
},
word = regexParser(/^\w+/),
whitespace = regexParser(/^[\s\r\n]+/),
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
blahs = separatedBy(whitespace,word),

obj = digits(function(ds){
  return whitespace( function(s){
    console.log('1: ');
    return blahs;
  });}),
obj = bind(digits,function(ds){
  return bind(whitespace,function(s){
    return blahs;
  });
}),
  z;
  var
  objMaybe = obj(function(p){
    console.log('simple: ');
    eyes.inspect(p);
    console.log('simple - 1');
    return retern(p);
  });
  console.log('promiseMaybe: ',promiseMaybe);

objMaybe('9876 asdf qwer poiu lkjh')(function(x){
  console.log('simple - 2');
  eyes.inspect(x);
  console.log('simple - 3');
});
