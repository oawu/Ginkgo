/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path = require('path');
const Exec = require('child_process').exec;
const FileSystem  = require('fs');

const rootDiv = '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..' + Path.sep;
const Ginkgo = require('../Ginkgo');

function rollbackCheckout(_v) {
  const title = Ginkgo.cc('      ◎ ', 'p2') + '分支切換回 ' + Ginkgo.cc(_v.gitOri.branch, 'w2') + ' 分支';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  Exec('git checkout ' + _v.gitOri.branch + ' --quiet', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git checkout ' + _v.gitOri.branch + ' --quiet', 'w2') + ' 失敗！' + '\n\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return process.exit(1);
  });
}

function rollbackClean(_v) {
  const title = Ginkgo.cc('      ◎ ', 'p2') + '清除恢復修改';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  Exec('git checkout .. --quiet', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git checkout .. --quiet', 'w2') + ' 失敗！' + '\n\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return rollbackCheckout(_v);
  });
}

function minifyCSS(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '壓縮 ' + Ginkgo.cc('.css', 'w2') + ' 檔案';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));
  const files = Ginkgo.mapDir(Path.resolve(__dirname, rootDiv + Path.sep + 'css') + Path.sep).filter(function(file) { return file.match(/\.css$/g); });

  let i = 0;

  try {
    for (; i < files.length; i++) {
      const code = FileSystem.readFileSync(files[i], "utf8").replace(/\n*/g, '');
      FileSystem.writeFileSync(files[i], code, "utf8");
    }
  } catch(e) {
    let message = Ginkgo.cc(e.message, 'w2');
    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤發生在：' + Ginkgo.cc(files[i].replace(Path.resolve(__dirname, rootDiv) + Path.sep, ''), 'w2') + '\n');
    Ginkgo.print('     ' + Ginkgo.cc(' ◎ ', 'p2') + '以下可能是錯誤原因：\n' + Ginkgo.cc('===', 'w0') + '\n\n' + message + '\n\n' + Ginkgo.cc('===', 'w0') + '\n\n');
    return rollbackClean(_v);
  }

  Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
  closure(_v.cho);
}

function minifyHTML(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '壓縮 ' + Ginkgo.cc('.html', 'w2') + ' 檔案';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));
  

  const files = Ginkgo.mapDir(Path.resolve(__dirname, rootDiv) + Path.sep).filter(function(file) { return file.match(/\.html$/g); });
  const minify = require('html-minifier').minify;
  
  let i = 0;
  try {
    for (; i < files.length; i++) {
      const code = FileSystem.readFileSync(files[i], "utf8");
      FileSystem.writeFileSync(files[i], minify(code, {collapseWhitespace: true}), "utf8");
    }
  } catch(e) {
    let message = Ginkgo.cc(e.message, 'w2');
    if (e.message.match(/^Parse Error:/g)) {
      message = e.message.split(/^Parse Error:/gi).map(Function.prototype.call, String.prototype.trim).filter(function(t) { return t.length; }).join('');
      message = message.length > 100 ? Ginkgo.cc(message.slice(0, 100), 'w2') + Ginkgo.cc('…', 'w0') : Ginkgo.cc(message, 'w2');
    }

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤發生在：' + Ginkgo.cc(files[i].replace(Path.resolve(__dirname, rootDiv) + Path.sep, ''), 'w2') + '\n');
    Ginkgo.print('     ' + Ginkgo.cc(' ◎ ', 'p2') + '以下可能是錯誤原因：\n' + Ginkgo.cc('===', 'w0') + '\n\n' + message + '\n\n' + Ginkgo.cc('===', 'w0') + '\n\n');
    return rollbackClean(_v);
  }

  Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
  minifyCSS(_v, closure);
}

function uglifyJS(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '壓縮 ' + Ginkgo.cc('.js', 'w2') + ' 檔案';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  const files = Ginkgo.mapDir(Path.resolve(__dirname, rootDiv + Path.sep + 'js') + Path.sep).filter(function(file) { return file.split(/\.js$/g); });
  const UglifyJS = require("uglify-js");

  let i = 0;
  try {
    for (; i < files.length; i++) {
      let code = FileSystem.readFileSync(files[i], "utf8");
      const result = UglifyJS.minify(code, { mangle: { toplevel: true } });
      
      if (result.error)
        throw result.error;

      FileSystem.writeFileSync(files[i], result.code, "utf8");
    }
  } catch(e) {
    let message = Ginkgo.cc(e.message, 'w2');
    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤發生在：' + Ginkgo.cc(files[i].replace(Path.resolve(__dirname, rootDiv) + Path.sep, ''), 'w2') + '\n');
    Ginkgo.print('     ' + Ginkgo.cc(' ◎ ', 'p2') + '以下可能是錯誤原因：\n' + Ginkgo.cc('===', 'w0') + '\n\n' + message + '\n\n' + Ginkgo.cc('===', 'w0') + '\n\n');
    return rollbackClean(_v);
  }

  Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
  minifyHTML(_v, closure);
}

module.exports.run = function(_v, closure) {
  return uglifyJS(_v, closure);
};