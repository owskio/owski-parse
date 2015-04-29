
var
fs = require('fs')
q = require('q'),
zlib = require('zlib');

q.denodeify(fs.readFile)('inst.pdf','binary')
.then(function(data){
  var
  matches,
  output = [],
  pattern = /FlateDecode.*stream[\s\S]{2}([\s\S]*?)endstream/g;

  while (matches = pattern.exec(data)) {
    var match = matches[1];
    output.push(match);
  }
  var chosenStream = output[76];
  console.log('chosenStream: ',chosenStream);
  return chosenStream;
})
.then(function(data){
  return new Buffer(data,'binary');
})
.then(function(buff){
  var dfd = q.defer();
  zlib.inflate(buff,function(e,b){
    console.log('bits LENGTH: ',b.length);
    dfd.resolve(b);
  });
  return dfd.promise;
})
.then(function(b){
  var pdfCode = b.toString();
  console.log('uncompressed: \n',pdfCode);
  return pdfCode;
})
.then(function(pdfCode){
  return q.denodeify(fs.writeFile,'pdfCode.txt',pdfCode);
})
.fail(function(){
  console.log(arguments);
});
