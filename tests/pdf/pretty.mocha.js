//
// String.prototype.repeat= function(n){
//   n= n || 1;
//   return Array(n+1).join(this);
// }
// var indent = 0;
// pretty = function(str){
//   var
//   match,
//   pattern = /<<(.+?)>>/;
//   while(match = pattern.exec(str)){
//
//   }
//   return str.replace(/<<([^<]+?)>>/g,function(whole,code){
//     //console.log(arguments);
//     indent++;
//     var
//     result  = '\r\n' + '  '.repeat(indent+1) + '<<' + code
//             + '\r\n' + '  '.repeat(indent+1) + '>>'
//             + '\r\n' + '  '.repeat(indent+1);
//     indent--;
//     return result;
//   });
// };
// var prettied = pretty('asdf<<qwer<<oiuy>>uytr<<poiu>>mnbv>>');
// console.log(prettied)
