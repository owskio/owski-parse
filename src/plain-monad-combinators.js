
var l = console.log.bind(console)
  , eyes = require('eyes')
  , eye = eyes.inspect.bind(eyes)
  , Parser = function(parse){
    if(!(this instanceof Parser)){
      return new Parser(parse);
    }
    this.parse = parse;
  };
Parser.prototype.as = function(fn){
  var me = this;
  return Parser(function(input){
    var results = me.parse(input);
    var nextParser = fn.apply(me,results);
    return nextParser.parse(results[1]);
  });
};

var
regexParser = function(pattern){
  return Parser(function(input){
    var
    arr = input.match(pattern),
    result = arr && arr[0] || '',//what if matching empty string??
    rest = result ? input.slice(result.length) : input;
    return [result,rest];
  });
},
end = function(val){
  return Parser(function(inp){
    return [val,inp];
  });
},
word = regexParser(/^\w+/),
whitespace = regexParser(/^[\s\r\n]+/),
digits = regexParser(/^\d+/),
digit = regexParser(/^\d/),
comma = regexParser(/^,/),
string = function(str){
  return regexParser(new RegExp('^' + str));
};

// (+++) :: Parser a -> Parser a -> Parser a
// p +++ q = Parser (\cs -> case parse (p ++ q) cs of
// [] -> []
// (x:xs) -> [x])
// Parse repeated applications of a parser p; the many combinator permits zero
// or more applications of p, while many1 permits one or more:
// many :: Parser a -> Parser [a]
// many p = many1 p +++ return []
// many1 :: Parser a -> Parser [a]
// many1 p = do {a <- p; as <- many p; return (a:as)}
many = function(someParser){
  return someParser.as(function(match){
  return match ?
    many(someParser).as(function(matches){
      return end([match].concat(matches));
    }):
    end([]);
  });
},


or = function(parserA,parserB){
  return parserA.as(function(a){
    return a
      ? end(a)
      : parserB;
  });
},

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

separatedBy = function(separatorParser,someParser){
  //Discard the result of the first parser, keep second
  var
  discardParser = separatorParser.as(function(){ return someParser; });
  //Take the first, then treat the rest as many (junk,gold) pairs
  return someParser         .as(function(match){
  return many(discardParser).as(function(matches){
  return end(
    [match].concat(matches)
  );});});
},


sentence =
          word                              .as(function(w){
  return  whitespace                        .as(function(s){
  return  many(digit)                       .as(function(d){
  return  whitespace                        .as(function(s2){
  return  string('world')                   .as(function(scope){
  return  whitespace                        .as(function(s3){
  return  or(string('yall'),string('guys')) .as(function(audience){
  return  whitespace                        .as(function(s3){
  return  separatedBy(comma,word)           .as(function(friends){
  return  end({
    word    : w,
    space   : s,
    digits  : d,
    scope   : scope,
    audience: audience,
    friends : friends
  });});});});});});});});});});


var parsed = sentence.parse('hello 123 world guys jim,jay,jon,joe,joy,jeb');
eye(parsed[0]);
