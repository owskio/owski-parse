




var log = console.log.bind(console);




//monadic 'return' as 'some'
var some = function(val){
      return Parser(function(){
        return val;
      });
    }
  , Parser = function(parse){
      if(!(this instanceof Parser)){
        return new Parser(parse);
      }
      this.parse = parse;
    };
// monadic 'bind' as 'as'
Parser.prototype.as = function(fn){
  var me = this;
  return Parser(function(input){
    var results     = me.parse(input)
      , nextParser  = fn.apply(me,results)
      , remainder   = results[1]
      ;
    return nextParser.parse(remainder);
  });
};





var regexParser = function(pattern){
      return Parser(function(input){
        var arr     = input.match(pattern)
          , result  = arr && arr[0]
          , rest    = input.slice(result.length)
          ;
        return [result,rest];
      });
    }
  , word        = regexParser(/^\w+/)
  , whitespace  = regexParser(/^[\s\r\n]+/)
  , digits      = regexParser(/^\d+/);





//lemonade
var streetAndHouseNumber =
          word      .as(function(w){
  return  whitespace.as(function(s){
  return  digits    .as(function(d){
  return  some({
    street:  w,
    number:  d
  });});});});


//{ street: 'Main', number: '123' }
log(
  streetAndHouseNumber.parse(
    'Main 123'
  )
);
