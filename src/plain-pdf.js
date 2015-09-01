

var expose     = require('owski-expose')
  , curry      = require('owski-curry').curry
  , eyes       = require('eyes')
  , primitives = require('owski-primitives')
  , K          = primitives.K
  , I          = primitives.I
  , undefined  = primitives.undefined
  , compose    = require('owski-apply').compose
  , Promise    = require('owski-promise').Promise
  , fs         = require('fs')
  , _          = require('highland')
  , log        = console.log.bind(console)

  , end = function(val){
    return Parser(function(inp){
      return [val,inp];
    });
  }
  , trampoline = function(promiseGenerator){
    return function(input){
      var block = Promise();
      setTimeout(function(){
        block.resolveWith(input);
      },0);
      return block.then(promiseGenerator);
    };
  }
  , Parser = function(parse){
    if(!(this instanceof Parser)){
      return new Parser(parse);
    }
    //this.parse = trampoline(parse);
    this.parse = parse;
  };

// monadic 'bind'
// Parser.prototype.as = function(fn){
//   var me = this;
//   //? return Parser(trampoline(...));
//   return Parser(function(input){
//     var results     = me.parse(input)
//     , nextParser  = fn.apply(me,results)
//     , remainder   = results[1]
//     ;
//     log('INPUT TO BACK: ',results)
//     return nextParser.parse(remainder);
//   });
// };

// monadic 'bind'
Parser.prototype.as = function(fn){
  var me = this;
  //? return Parser(trampoline(...));
  return Parser(function(input){
    var block = Promise();
    setTimeout(function(){
      block.resolveWith(input);
    },0);
    return block
      .then(function(input){
        return me.parse(input);
      })
      .then(function(results){
        if(!results || !results[0]){
          log('Returning dummy parser: "',results,'"');
          return undefined;//Parse has failed
        }
        var nextParser  = fn.apply(me,results)
          , remainder   = results[1]
          ;
        //log('INPUT TO BACK: ',results)
        return nextParser.parse(remainder);
      });
  });
};

var
regexParser = function(pattern){
  return Parser(function(input){
    if(!input)log('No input for patter: ',pattern);
    var
    arr = input.match(pattern),
    result = arr && arr[0] || '',//what if matching empty string??
    rest = result ? input.slice(result.length) : input;
    return [result,rest];
  });
}

  , word        = regexParser(/^\w+/)
  , whitespace  = regexParser(/^[\s\r\n]+/)
  , emptyLines  = whitespace
  , digit       = regexParser(/^\d/)
  , digits      = regexParser(/^\d+/)
  , number      = regexParser(/^\d+/)
  , wordChar    = regexParser(/^\w/)
  , nonWordChar = regexParser(/^\W/)
  , whitespace  = regexParser(/^[\s\r\n]+/)
  , space       = regexParser(/^\s/)
  , line        = regexParser(/^.*\r?\n?/)


  , string = function(str){
    return regexParser(new RegExp('^' + str));
  }
  , until = function(string){
    var pattern = new RegExp('^([\s\S\r\n]+?)' + string);
    return Parser(function(input){
      var
      arr = input.match(pattern),
      result = arr && arr[1] || '',//what if matching empty string??
      rest = result ? input.slice(result.length) : input;
      return [result,rest];
    });
  }
  , many = function(someParser){
    return someParser.as(function(match){
      log('MATCH?: ',match);
      return match ?
      many(someParser).as(function(matches){
        return end([match].concat(matches));
      }):
      end([]);
    });
  }
  , or = function(parserA,parserB){
    return parserA.as(function(a){
      return a
      ? end(a)
      : parserB;
    });
  }
  , separatedBy = function(separatorParser,someParser){
    //Discard the result of the first parser, keep second
    var
    discardParser = separatorParser.as(function(){ return someParser; });
    //Take the first, then treat the rest as many (junk,gold) pairs
    return someParser         .as(function(match){
    return many(discardParser).as(function(matches){
    return end(
          [match].concat(matches)
    );});});
  }


  , pdfObject =
           //emptyLines      .as(function(){
    //return
           number          .as(function(objectReference){
             log('OBJECT Number: ['+objectReference+']');
    return space           .as(function(){
    return number          .as(function(objectRefCountNumber){
    return space           .as(function(){
    return string('obj')   .as(function(){
    return until ('endobj').as(function(contents){
    return string('endobj').as(function(){
    return end({
      objectReference:      objectReference,
      objectRefCountNumber: objectRefCountNumber,
      contents:             contents.slice(0,20)
    });});});});});});});})//;})

  , pdfObjects = separatedBy(whitespace,pdfObject)

  , versionChars = regexParser(/^[\d\.]+/)
  , pdfVersion =
           string('%PDF-').as(function(){
    return versionChars   .as(function(version){
    return line           .as(function(line1){
    return line           .as(function(gobbly){
    return end(
      version
    );});});});})
  , pdf =
           pdfVersion.as(function(number){
    return pdfObjects.as(function(objects){
    return end({
        version: number
      , objects: objects
    });});})
  ;
  fs.readFile('../pdf/inst.pdf',{encoding:'utf8'}, function (e, data) {
    log('---------------------------------------------------');
    log(data.slice(0,50) + 'endobj');
    log('---------------------------------------------------');
    pdf.parse(data.slice(0,50) + 'endobj').then(function(result){
      log('FINISHED!!!: ',result);
    });
  });

  // _(fs.createReadStream('../pdf/inst.pdf',{encoding:'utf8'}))
  // .map(function(chunk){
  //
  //   return '\n\nCHUNK:\n' + chunk.slice(0,10);
  // })
  // .pipe(process.stdout);


  // .map(function(){
  //   var promise = pdf(function(p){
  //     eyes.inspect(p);
  //     return some(p);
  //   })(pdfData);
  //   promise.then(function(x){
  //     eyes.inspect(x);
  //     done();
  //   });
  // });
