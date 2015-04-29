
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

regexParser = function(pattern){
  return parser(function(input){
    var
    arr = input.match(pattern);
    return arr && arr[0];
  });
},
wordChar = regexParser(/^\w/),
puctuationChar = regexParser(/^\W/),
digit = regexParser(/^\d/),

many = curry(function(someParser,then){
  return someParser(function(match){
    console.log('match: ',match);
    return match
    ? many(someParser,function(matches){
        console.log('matches: ',matches);
        return then([match].concat(matches));
      })
    : then([]);
  });
}),
or = curry(function(parserA,parserB,then){
   return parserA(function(a){
     return a
     ? then(a)
     : parserB(K);
   });
}),
//https://www.cs.nott.ac.uk/~gmh/pearl.pdf
//Parse repeated applications of a parser p,
//separated by applications of a parser
//sep whose result values are thrown away:
//
//  sepby :: Parser a -> Parser b -> Parser [a]
//  p ‘sepby‘ sep = (p ‘sepby1‘ sep) +++ return []
//
//  sepby1 :: Parser a -> Parser b -> Parser [a]
//  p ‘sepby1‘ sep = do a <- p
//                      as <- many (do {sep; p})
//                      return (a:as)
separated = function(someParser,separatorParser,then){
  var
  discardParser = function(then){
    return separatorParser(function(separator){
      return someParser(function(parsed){
        return then(parsed);
      });
    });
  };
  return someParser(function(match){
    return many(discardParser,function(matches){
      return then([match].concat(matches));
    });
  });
};

expose(module,{
  parser: parser,
  regexParser: regexParser,
  many: many,
  wordChar: wordChar,
  separated:separated,
  puctuationChar:puctuationChar,
  or: or
});
