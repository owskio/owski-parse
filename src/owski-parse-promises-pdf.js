
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
l = function(){
  console.log.apply(console,arguments);
},

retern = function(z){
  console.log('z: ',z);
  return function(){
    console.log('returning Promise(z)');
    return Promise(z);
  };
},
parser = curry(function(parse,back,input){
  var block = Promise();
  var tackle = block.then(function(input){
    var result = parse(input);
    var consumed = result ? result.length : 0;
    var rest = input.slice(consumed);
    var maybeNextParser =  back(result);
    if(!maybeNextParser){ console.log('result: ',result); }
    var nextParser = maybeNextParser || retern(undefined);
    return nextParser(rest);
  });
  setTimeout(function(){
    block.resolveWith(input);
  },0);
  return tackle;
}),


regexParser = function(pattern){
  return parser(function(input){
    //console.log(pattern,' : ',input.slice(0,50));
    var
    arr = input.match(pattern);
    return arr && arr[0];
  });
},
regexWordChar = regexParser(/^\w/),
regexNonWordChar = regexParser(/^\W/),
regexDigit = regexParser(/^\d/),
regexNumber = regexParser(/^\d+/),
whitespace = regexParser(/^[\s\r\n]+/),
space = regexParser(/^\s/),
line = regexParser(/^.*?\r\n/),

string = function(str){
  //console.log('str: ',str);
  return parser(function(input){
    //console.log('input: ',input.slice(0,50));
    return input.slice(0,str.length) === str
      ? str
      : undefined;
  });
},

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

//  //Ideally, the direct translation below would work,
//  //but the application of separatorParser to its then
//  //expects input now, instead of its own then, which
//  //is what we need a parser to need.
//  discardParser = separatorParser(function(separator){
//    return someParser;
//  });

//  //More verbose, here for clarity
//  discardParser = function(then){
//    return separator( function(s){
//    return some(function(p){
//        return then(p);
//    });});
//  };

 // discardParser = function(then){
 //   return separator(function(){
 //   return some(then);
 //   });
 // };

separatedBy = curry(function(separatorParser,someParser,then){
  //Discard the result of the first parser, keep second
  //console.log('sep by arguments: \n',arguments);
  var
  discardParser = compose(separatorParser,K,someParser);
  //Take the first, then treat the rest as many (junk,gold) pairs
  return someParser(function(match){
    //console.log('sep_match: ',match);
    return many(discardParser,function(matches){
      //console.log('sep_matches: ',matches );
      return then([match].concat(matches));
    });
  });
}),
letter = parser(function(input){
  var
  code = input.charCodeAt(0),
  isLetter = 97 <= code && code <= 122
          && 65 <= code && code <= 90;
  return isLetter ? input[0] : undefined;
}),
word = many(letter),
versionChars = regexParser(/[\d\.]+/),
pdfVersion = function(then){
  //console.log('going into string');
  return string('%PDF-')(function(x){
    //console.log('x: ',x);
    return versionChars(then);
  });
},
pdfObjectContents = parser(function(input){
  var
  matches = input.match(/^([\s\S]+?)endobj/);
  return matches
  ? matches[1]
  : undefined;
}),
pdfObject = function(then){
  //console.log('then: ',then);
  return line(function(l){
  return line(function(l){
    return regexNumber(function(objectReference){
      //console.log('objectReference: ',objectReference);
      return space(function(_){
        return regexNumber(function(objectRefCountNumber){
          //console.log('objectRefCountNumber: ',objectRefCountNumber);
          return space(function(_){
            return string('obj')(function(_){
              return pdfObjectContents(function(contents){
                //console.log('pdfObjectContents: ',contents.slice(0,300));
                return string('endobj')(function(){

                  return then(
                    contents
                    ? {
                      objectReference: objectReference,
                      objectRefCountNumber: objectRefCountNumber,
                      contents: contents.slice(0,20)
                    }
                    : undefined
                  );

                  // var result = objectReference
                  // ? {
                  //   objectReference: objectReference,
                  //   objectRefCountNumber: objectRefCountNumber,
                  //   contents: contents.slice(0,20)
                  // }
                  // : undefined;
                  // console.log('result: ');
                  // eyes.inspect(result);
                  // return then(result);

                  // console.log('objectReference: ', objectReference);
                  // console.log('objectRefCountNumber: ', objectRefCountNumber);
                  // console.log('contents: ', contents);
                  // return then({
                  //   objectReference: objectReference,
                  //   objectRefCountNumber: objectRefCountNumber,
                  //   contents: contents.slice(0,20)
                  // });
                });
              });
            });
          });
        });
      });
    });
  });
  });
},
pdfObjects = separatedBy(whitespace,pdfObject),
pdf = function(then){
  return pdfVersion(function(number){
    //console.log('version: ',number);
    return pdfObjects(function(objects){
      // console.log('objects: ');
      // eyes.inspect(objects);
      return then({ version: number, objects: objects});
    });
  })
},
z;

expose(module,{
  parser:           parser,
  regexParser:      regexParser,
  many:             many,
  regexWordChar:    regexWordChar,
  separatedBy:      separatedBy,
  regexNonWordChar: regexNonWordChar,
  or:               or,
  pdf:              pdf,
  retern:           retern
});
