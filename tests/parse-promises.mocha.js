
var
l = function(){
  console.log.apply(console,arguments);
},
must = require('must'),
fs = require('fs'),
eyes = require('eyes');
require('owski-primitives').mport(function(K){
require('../src/owski-parse-promises-pdf').mport(function(or,regexWordChar,regexNonWordChar,many,separatedBy,pdf,retern){

  describe('parse',function(){
    // describe('char',function(){
    //   it('must parse a single ascii character',function(done){
    //     regexWordChar(function(c){
    //       return retern(c);
    //     })('qwer').then(function(c){
    //       c.must.be('q');
    //       done();
    //     });
    //   });
    // });
    //
    // describe('many',function(){
    //   it('takes a parser and returns [parsedStrings]',function(){
    //     many(regexWordChar,retern)(
    //       'git://www.google.com'
    //     ).then(function(x){
    //       x.must.eql(['g','i','t']);
    //     });
    //   });
    // });

    // describe('or',function(){
    //   it('yields the result of either parser',function(){
    //     or(regexWordChar,regexNonWordChar,retern)(
    //       'j-e-l-l-o'
    //     ).then(function(x){
    //       x.must.be('j');
    //     })
    //   });
    //   it('yields the result of subsequent successful parsers',function(){
    //     or(regexWordChar,regexNonWordChar,retern)(
    //       ':j-e-l-l-o'
    //     ).then(function(x){
    //       x.must.be(':');
    //     });
    //   });
    // });

    // describe('separated',function(){
    //   it('takes a parser and returns [parsedStrings]',function(){
    //     separatedBy(regexNonWordChar,regexWordChar,retern)(
    //       'j-e-l-l-o'
    //     ).then(function(x){
    //       x.must.eql(['j','e','l','l','o']);
    //     });
    //   });
    // });

    describe('PDF',function(){
      it('must give us something reasonable to look at',function(done){
        //this.timeout(10000);
        this.timeout(0);
        fs.readFile('pdf/inst.pdf','binary',function(err,pdfData){
          console.log('READFILE: ',pdfData.slice(0,30));
          pdf(function(p){
            console.log('pdf: ');
            eyes.inspect(p);
            retern(p);
          })(pdfData).then(function(x){
            eyes.inspect(x);
            done();
          });
        });
      });
    });

  });
});});
