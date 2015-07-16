
var l = console.log.bind(console);
var Parser = function(parse){
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
    result = arr && arr[0],
    rest = input.slice(result.length);
    return [result,rest];
  });
},
end = function(val){
  return Parser(function(){
    return val;
  });
},
word = regexParser(/^\w+/),
whitespace = regexParser(/^[\s\r\n]+/),
digits = regexParser(/^\d+/),
z;
l('word: ',word);


// monadic 'bind' >--+
var               // |
mappedWord =      // v
          word      .as(function(w){ //l('w: ',w);
  return  whitespace.as(function(s){ //l('['+s+']');
  return  digits    .as(function(d){ //l('d: '+d);
  return  end({
    word  : w,
    space : s,
    digits: d
  });});});});


l('mapped word: ',mappedWord);
var parsed = mappedWord.parse('hello 123 world');
l('parsed: ',parsed);
