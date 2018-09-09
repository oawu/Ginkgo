/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path = require('path');
const FileSystem  = require('fs');
const Ginkgo = require('../Ginkgo');
const rootDiv = '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..' + Path.sep;

function minifyCSS(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '壓縮 ' + Ginkgo.cc('.css', 'w2') + ' 檔案';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));
  const files = Ginkgo.mapDir(Path.resolve(__dirname, rootDiv + Path.sep + 'css') + Path.sep).filter(function(file) { return file.match(/\.css$/g); });

  for (let i = 0; i < files.length; i++) {
    const code = FileSystem.readFileSync(files[i], "utf8").replace(/\n*/g, '');
    FileSystem.writeFileSync(files[i], code, "utf8");
  }

  Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

  closure(_v.cho);
}

function minifyHTML(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '壓縮 ' + Ginkgo.cc('.html', 'w2') + ' 檔案';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));
  

  const files = Ginkgo.mapDir(Path.resolve(__dirname, rootDiv) + Path.sep).filter(function(file) { return file.match(/\.html$/g); });
  const minify = require('html-minifier').minify;
  
  for (let i = 0; i < files.length; i++) {
    const code = FileSystem.readFileSync(files[i], "utf8");
    FileSystem.writeFileSync(files[i], minify(code, {collapseWhitespace: true}), "utf8");
  }

  Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
 
  minifyCSS(_v, closure);
}

function uglifyJS(_v, closure) {

  const title = Ginkgo.cc('    ➤ ', 'C') + '壓縮 ' + Ginkgo.cc('.js', 'w2') + ' 檔案';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  const files = Ginkgo.mapDir(Path.resolve(__dirname, rootDiv + Path.sep + 'js') + Path.sep).filter(function(file) { return file.match(/\.js$/g); });

  const UglifyJS = require("uglify-js");

  for (let i = 0; i < files.length; i++) {
    let code = FileSystem.readFileSync(files[i], "utf8");
    FileSystem.writeFileSync(files[i], UglifyJS.minify(code, { mangle: { toplevel: true } }).code, "utf8");
  }

  Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
  minifyHTML(_v, closure);
}

module.exports.run = function(_v, closure) {
  return uglifyJS(_v, closure);
};