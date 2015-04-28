
require('must');
require('owski-primitives').mport(function(K){
require('../src/owski-parse').mport(function(or,wordChar,puctuationChar,many,separated){

  describe('parse',function(){
    describe('char',function(){
      it('must parse a single ascii character',function(done){
        wordChar(function(c){
          c.must.be('q');
          done();
        })('qwer');
      });
    });
    describe('many',function(){
      it('takes a parser and returns [parsedStrings]',function(){
        many(wordChar,K)(
          'git://www.google.com'
        )
        .must.eql(['g','i','t']);
      });
    });
    describe('or',function(){
      it('yields the result of either parser',function(){
        or(wordChar,puctuationChar,K)(
          'j-e-l-l-o'
        ).must.be('j');
      });
      it('yields the result of subsequent successful parsers',function(){
        or(wordChar,puctuationChar,K)(
          ':j-e-l-l-o'
        ).must.be(':');
      });
    });
    describe('separated',function(){
      it('takes a parser and returns [parsedStrings]',function(){
        separated(wordChar,puctuationChar,K)(
          'j-e-l-l-o'
        )
        .must.eql(['j','e','l','l','o']);
      });
    });
  });
});});
