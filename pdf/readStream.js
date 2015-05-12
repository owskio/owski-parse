
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

  var i = 1;
  while (matches = pattern.exec(data)) {
    var match = matches[1];
    console.log('MATCH['+i+']: \n',match.slice(0,20));
    output.push(match);
    i++;
  }
  //var chosenStream = output[76];
  var chosenStream = output[76];
  console.log('CHOSEN: \n',chosenStream);
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
  //console.log('uncompressed: \n',pdfCode);
  return pdfCode;
})
.then(function(pdf){
  String.prototype.repeat= function(n){
    n= n || 1;
    return Array(n+1).join(this);
  }
  var indent = 0;
  pretty = function(str){
    var
    result = '',
    matches,
    patt = /((>>)|(<<))([^><]*)/g;
    while(matches = patt.exec(str)){
      try{
      var
      close = matches[2],
      open = matches[3],
      code = matches[4];
      if (open) {
        indent++;
        result  +=  '\r\n'
                +   '  '.repeat(indent) + '<<' + code + '\r\n';
      } else {
        result +=  '  '.repeat(indent) + '>>' + '\r\n'
                 + '  '.repeat(indent) + code;
        indent--;
      }
      }catch(e){ break; }
    }
    console.log('Result: \n',result);
    return result;
  };
  console.log('BEFORE PRETTIED: \n',pdf);
  var prettied = pretty(pdf);
  console.log('PRETTIED: \n',prettied);
  return prettied;
})
.then(function(pdfCode){
  return q.denodeify(fs.writeFile,'pdfCode.txt',pdfCode);
})
.fail(function(){
  console.log('FAIL: ',arguments);
})
;
