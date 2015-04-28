
var
eyes = require('eyes'),
parser = require('./owski-parse').parser,
primitives = require('owski-primitives'),
K = primitives.K,

protocol = parser(function(input){
  var arr = input.match(/^[^:]+/);
  return arr && arr[0];
}),
host = parser(function(input){
  var arr = input.match(/[\w.]+/);
  return arr && arr[0];
}),
proHost = protocol(function(pro){
  return host(function(host){
    return K({pro: pro, host: host});
  });
});

eyes.inspect(
  proHost('http://www.google.com')
);
