var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var fs=require('react-native-fs');module.exports=Object.assign({},fs,{readdir:function(){var _readdir=(0,_asyncToGenerator2.default)(function*(path){return(yield fs.readDir(path)).map(function(f){return f.name;});});function readdir(_x){return _readdir.apply(this,arguments);}return readdir;}()});