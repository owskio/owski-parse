
var
l = function(){
  console.log.apply(console,arguments);
},
must = require('must'),
fs = require('fs'),
eyes = require('eyes');
require('owski-primitives').mport(function(K){
require('../src/plain-pdf').mport(function(pdf){

  describe('parse',function(){

    describe('PDF',function(){
      it('must give us something reasonable to look at',function(done){
        //this.timeout(10000);
        this.timeout(0);
        fs.readFile('pdf/inst.pdf','binary',function(err,pdfData){
          console.log('READFILE: ',pdfData.slice(0,30));
          var promise = pdf(function(p){
            console.log('pdf: ');
            eyes.inspect(p);
            console.log('pdf - 1');
            return retern(p);
          })(pdfData);
          console.log('promise: ',promise);
          promise.then(function(x){
            console.log('pdf - 2');
            eyes.inspect(x);
            console.log('pdf - 3');
            done();
          });
        });
      });
    });

  });
});});
