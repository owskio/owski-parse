
require('must');
require('owski-primitives').mport(function(K){
require('../owski-parse').mport(function(wordChar,many){

  describe('parse',function(){
    describe('char',function(){
      it('must parse a single ascii character',function(){

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
  });
});});
