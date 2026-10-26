// Syntax check of the TV runtime against the TV's Node (webOS 4.x ships Node v0.12.2).
// Run it with Node 0.12 itself (CI uses the node:0.12 Docker image): every runtime/*.js file is compiled, not run,
// so ES2015+ syntax such as 0o600, let/const in sloppy mode or arrow functions fails here instead of on a TV.
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var dir = path.join(__dirname, '..', 'runtime');
var files = fs.readdirSync(dir).filter(function (f) { return /\.js$/.test(f); }).sort();
var failed = 0;
files.forEach(function (f) {
  var file = path.join(dir, f);
  var src = fs.readFileSync(file, 'utf8').replace(/^#!.*/, '');
  try {
    // same wrapper shape as Node's module loader, so top-level return and `require` parse the same way
    new vm.Script('(function (exports, require, module, __filename, __dirname) {' + src + '\n});', file);
    console.log('ok   runtime/' + f);
  } catch (e) {
    failed++;
    console.log('FAIL runtime/' + f + ': ' + e);
  }
});
console.log('node ' + process.version + ': ' + files.length + ' files, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
