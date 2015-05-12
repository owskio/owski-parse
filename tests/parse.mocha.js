
var
must = require('must'),
fs = require('fs'),
eyes = require('eyes');
require('owski-primitives').mport(function(K){
require('../src/owski-parse').mport(function(or,regexWordChar,regexNonWordChar,many,separatedBy,pdf){

  describe('parse',function(){
    describe('char',function(){
      it('must parse a single ascii character',function(done){
        regexWordChar(function(c){
          c.must.be('q');
          done();
        })('qwer');
      });
    });
    describe('many',function(){
      it('takes a parser and returns [parsedStrings]',function(){
        many(regexWordChar,K)(
          'git://www.google.com'
        )
        .must.eql(['g','i','t']);
      });
    });
    describe('or',function(){
      it('yields the result of either parser',function(){
        or(regexWordChar,regexNonWordChar,K)(
          'j-e-l-l-o'
        ).must.be('j');
      });
      it('yields the result of subsequent successful parsers',function(){
        or(regexWordChar,regexNonWordChar,K)(
          ':j-e-l-l-o'
        ).must.be(':');
      });
    });
    describe('separated',function(){
      it('takes a parser and returns [parsedStrings]',function(){
        separatedBy(regexNonWordChar,regexWordChar,K)(
          'j-e-l-l-o'
        )
        .must.eql(['j','e','l','l','o']);
      });
    });
    describe('PDF',function(){
      it('must give us something reasonable to look at',function(done){
        fs.readFile('pdf/inst.pdf','binary',function(err,pdfData){
          console.log('READFILE: ',pdfData.slice(0,30));
          pdf(function(pdfObject){
            console.log('pdfObject: ',pdfObject);
            eyes.inspect(pdfObject);
            done();
          })(pdfData);
        });
      });
    });
  });
});});
