/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */
 
const Ginkgo = require('./libs/node/Ginkgo');

const rootDiv     = '..';
const Path        = require('path');
const FileSystem  = require('fs');
const Exec        = require('child_process').exec;

const livereloadDirs = [
  rootDiv + Path.sep + 'js',
  rootDiv + Path.sep + 'css',
  rootDiv + Path.sep + 'img',
  rootDiv + Path.sep + '**' + Path.sep + '*.html',
];


let Reload    = null;
let Notifier  = null;
let Chokidar  = null;
let CmdExists = null;

let chokidarIconFontReady = false;
let chokidarScssFileReady = false;
let isListenIconFont      = false;
let isListenScssFile      = false;
let isListenLivereload    = false;
let isNotifierShow        = true;

function main(first) {

  function notifier(title, subtitle, message) {
    isNotifierShow && new Notifier().notify({
      title: title,
      subtitle: subtitle,
      message: message,
      sound: true,
      wait: false,
      timeout: 5,
      closeLabel: '關閉',
      actions: ['不再顯示'],
      dropdownLabel: '其他',
    }, function(err, response, metadata) {
      if (response == 'activate' && metadata.activationValue == '不再顯示')
        isNotifierShow = false;
    });

    return true;
  }

  function isPortTaken(port, closure) {
    const tester = require('net').createServer();

    tester.once('error', function(err) {
      return err.code != 'EADDRINUSE' ? closure(err) : closure(null, true);
    }).once('listening', function() {
      tester.once('close', function() { closure(null, false); }).close();
    }).listen(port);
  }

  function openLivereload() {
    const title = Ginkgo.cc('    ➤ ', 'C') + '開啟 LiveReload';
    Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

    const server = Reload.createServer();
    const sendAllClients = server.sendAllClients;

    server.sendAllClients = function(data) {
      sendAllClients.bind(server)(data);
      data = JSON.parse(data);
      const name = data.path.replace(new RegExp('^' + rootDiv + Path.sep), '');
      chokidarIconFontReady && chokidarScssFileReady && Ginkgo.print(Ginkgo.cc('    ➤ ', 'c2') + Ginkgo.cc('[Livereload] ', 'y2') + Ginkgo.cc('刷新', 'w') + ' ' + Ginkgo.cc(name, 'w2') + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
    };

    server.watch(livereloadDirs);
    
    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
    isListenLivereload = true;
  }

  function buildIconFont(e, p, dir) {
    const name = dir == 'icomoon' ? false : dir;
    const title = Ginkgo.cc('    ➤ ', 'c2') + Ginkgo.cc('[Icon Fonts] ', 'P') + Ginkgo.cc(e, e == '刪除' ? 'w' : 'w') + ' ' + Ginkgo.cc(dir, 'w2') + ' 目錄' + Ginkgo.cc(' ─ ', 'w0');

    if (e == '刪除') {
      return FileSystem.exists(p = Path.resolve(__dirname, rootDiv + Path.sep + 'scss' + Path.sep + 'icon' + (name ? '-' + name : '') + '.scss'), function(exists) {
        
        if (!exists)
          return chokidarIconFontReady && Ginkgo.print(title + Ginkgo.cc('成功', 'g') + '\n');

        FileSystem.unlink(p, function(err) {
          return chokidarIconFontReady && (err ? notifier('[Icon Fonts] 錯誤！', '檔案無法刪除', '請至終端機確認錯誤原因！') && Ginkgo.print(title + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n') : Ginkgo.print(title + Ginkgo.cc('成功', 'g') + '\n'));
        });
      });
    }
    
    FileSystem.readFile(p, 'utf8', function(err, data) {
      if (err)
        return chokidarIconFontReady && notifier('[Icon Fonts] 錯誤！', '檔案無法讀取', '請至終端機確認錯誤原因！') && Ginkgo.print(title + Ginkgo.cc('失敗', 'r') + '\n' + '  ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

      data = data.match(/\.icon-[a-zA-Z_\-0-9]*:before\s?\{\s*content:\s*"[\\A-Za-z0-9]*";(\s*color:\s*#[A-Za-z0-9]*;)?\s*}/g);
      data = Array.isArray(data) ? data.map(function(v) { return v.replace(/^\.icon-/g, '.icon-' + (name ? name + '-' : '')).replace(/\n/g, ' ').replace(/\{\s*/g, '{ '); }) : [];
      data = '//\n// @author      OA Wu <comdan66@gmail.com>\n// @copyright   Copyright (c) 2015 - 2018, Ginkgo\n// @license     http://opensource.org/licenses/MIT  MIT License\n// @link        https://www.ioa.tw/\n//\n\n' + (data.length ? '@import "compass/css3/font-face";\n\n@include font-face("icon' + (name ? '-' + name : '') + '", font-files(\n  "' + (name ? name : 'icomoon') + '/fonts/icomoon.eot",\n  "' + (name ? name : 'icomoon') + '/fonts/icomoon.woff",\n  "' + (name ? name : 'icomoon') + '/fonts/icomoon.ttf",\n  "' + (name ? name : 'icomoon') + '/fonts/icomoon.svg"));\n\n*[class^="icon' + (name ? '-' + name : '') +'-"]:before, *[class*=" icon' + (name ? '-' + name : '') +'-"]:before {\n  font-family: "icon' + (name ? '-' + name : '') + '";\n\n  speak: none;\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n}\n\n' + data.join('\n') : '@import "compass/css3/font-face";');

      p = Path.resolve(__dirname, rootDiv + Path.sep + 'scss' + Path.sep + 'icon' + (name ? '-' + name : '') + '.scss');
      FileSystem.writeFile(p, data, function(err) {
        return chokidarIconFontReady && (err ? notifier('[Icon Fonts] 錯誤！', '檔案無法寫入', '請至終端機確認錯誤原因！') && Ginkgo.print(title + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n') : Ginkgo.print(title + Ginkgo.cc('成功', 'g') + '\n'));
      });
    });
  }

  function compileScss(e, p) {
    const css = p.replace(Path.resolve(__dirname, rootDiv + Path.sep + 'scss'), Path.resolve(__dirname, rootDiv + Path.sep + 'css')).replace(/\.scss$/, '.css');

    if (e == '刪除')
      return FileSystem.exists(css, function(exists) {
        const title = Ginkgo.cc('    ➤ ', 'c2') + Ginkgo.cc('[Scss Files] ', 'b2') + Ginkgo.cc(e, 'w') + ' ' + Ginkgo.cc(css.replace(Path.resolve(__dirname, rootDiv + Path.sep + 'css') + Path.sep, ''), 'w2') + Ginkgo.cc(' ─ ', 'w0');

        if (!exists)
          return chokidarScssFileReady && Ginkgo.print(title + Ginkgo.cc('成功', 'g') + '\n');

        FileSystem.unlink(css, function(err) {
          chokidarScssFileReady && (err ? notifier('[Scss Files] 錯誤！', '檔案無法刪除', '請至終端機確認錯誤原因！') && Ginkgo.print(title + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n') : Ginkgo.print(title + Ginkgo.cc('成功', 'g') + '\n'));
        });
      });

    Exec('compass compile', function(error, stdout, stderr) {
      const token = stdout.replace(/\x1b[[][^A-Za-z]*[A-Za-z]/g, '').split(/\s/).map(Function.prototype.call, String.prototype.trim).filter(function(t) { return t !== ''; });

      if (!token.length)
        return;

      const action = token.shift();
      const file = token.shift();
      let   title = Ginkgo.cc('    ➤ ', 'c2') + Ginkgo.cc('[Scss Files] ', 'b2') + Ginkgo.cc(e, 'w') + ' ';

      if (action == 'write')
        return chokidarScssFileReady && Ginkgo.print(title + Ginkgo.cc(file.replace(Path.resolve(__dirname, rootDiv + Path.sep + 'css') + Path.sep, ''), 'w2') + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
      
      if (action == 'error') {

        const token2 = /\(Line\s*(\d+):\s*(.*)\)/g.exec(token.join(' '));
        title = title + Ginkgo.cc(file.replace(Path.resolve(__dirname, rootDiv + Path.sep + 'scss') + Path.sep, ''), 'w2') + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r');

        if (!Array.isArray(token2))
          return chokidarScssFileReady && Ginkgo.print(title + '\n     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(token.join(' '), 'w2') + '\n');

        title += token2.length >= 2 ? Ginkgo.cc(' ─ ', 'w0') + '第 ' + Ginkgo.cc(token2[1], 'y2') + ' 行' : '';
        title += token2.length >= 3 ? '\n     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(token2[2], 'w2') + '\n' : '';
        
        return chokidarScssFileReady && notifier('[Scss Files] 錯誤！', '編譯 SCSS 檔案發生錯誤', '請至終端機確認錯誤原因！') && Ginkgo.print(title + '\n');
      }
      
      if (token[0] == 'delete')
        return;
    });
  }

  function watchIconFont() {
    const title = Ginkgo.cc('    ➤ ', 'C') + '監控 Font 目錄';
    Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

    Chokidar.watch(Path.resolve(__dirname, rootDiv + Path.sep + 'font'))
    .on('change', function(p) {
      const tokens = p.replace(Path.resolve(__dirname, rootDiv + Path.sep + 'font'), '').split(Path.sep).map(Function.prototype.call, String.prototype.trim).filter(function(v) { return v.length; });
      tokens.length == 2 && tokens[1] == 'style.css' && buildIconFont('修改', p, tokens[0]);
    })
    .on('add', function(p) {
      const tokens = p.replace(Path.resolve(__dirname, rootDiv + Path.sep + 'font'), '').split(Path.sep).map(Function.prototype.call, String.prototype.trim).filter(function(v) { return v.length; });
      tokens.length == 2 && tokens[1] == 'style.css' && buildIconFont('新增', p, tokens[0]);
    })
    .on('unlink', function(p) {
      const tokens = p.replace(Path.resolve(__dirname, rootDiv + Path.sep + 'font'), '').split(Path.sep).map(Function.prototype.call, String.prototype.trim).filter(function(v) { return v.length; });
      tokens.length == 2 && tokens[1] == 'style.css' && buildIconFont('刪除', p, tokens[0]);
    })
    .on('error', function(err) {
      notifier('[監控 Font 目錄] 警告！', '監控 Font 目錄發生錯誤', '請至終端機確認錯誤原因！');
      Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n');
      return watchScssFile();
    })
    .on('ready', function() {
      Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
      isListenIconFont = true;
      setTimeout(function() { chokidarIconFontReady = true; }, 1000);
      return watchScssFile();
    });
  }

  function watchScssFile() {
    const title = Ginkgo.cc('    ➤ ', 'C') + '監控 Scss 檔案';
    Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

    CmdExists('compass', function(err, exists) {
      if (err)
        return notifier('[監控 Scss 檔案] 錯誤！', '偵測不到 Compass 指令', '請至終端機確認錯誤原因！') && Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '  ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

      if(!exists) {
        notifier('[監控 Scss 檔案] 警告！', '不存在 Compass 指令', '請至終端機確認錯誤原因！') && Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '無法執行 ' + Ginkgo.cc('compass', 'w2') + ' 指令。' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '請確認終端機是否可以執行 compass 指令。' + '\n');
        return watchLivereloadFile();
      }

      let compassCompileTimer = null;

      Chokidar.watch(Path.resolve(__dirname, rootDiv + Path.sep + 'scss' + Path.sep + '**' + Path.sep + '*.scss'))
      .on('change', function(p) {
        clearTimeout(compassCompileTimer);
        compassCompileTimer = setTimeout(compileScss.bind(null, '修改', p), 250);
      })
      .on('add', function(p) {
        clearTimeout(compassCompileTimer);
        compassCompileTimer = setTimeout(compileScss.bind(null, '新增', p), 250);
      })
      .on('unlink', function(p) {
        setTimeout(compileScss.bind(null, '刪除', p), 250);
      })
      .on('error', function(err) {
        notifier('[監控 Scss 檔案] 警告！', '監控 Scss 檔案發生錯誤', '請至終端機確認錯誤原因！');
        Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n');
        return watchLivereloadFile();
      })
      .on('ready', function() {
        Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
        isListenScssFile = true;
        setTimeout(function() { chokidarScssFileReady = true; }, 3000);
        return watchLivereloadFile();
      });
    });
  }

  function watchLivereloadFile() {
    Ginkgo.print('\n' + Ginkgo.cc(' 【開啟 LiveReload】', 'y') + '\n');
    
    const title = Ginkgo.cc('    ➤ ', 'C') + '確認有無其他專案正在使用';
    Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

    isPortTaken(35729, function(err, use) {
      if (err !== null || use) {
        Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + (err !== null ? '偵測錯誤，錯誤原因：' + Ginkgo.cc(err, 'w2') : '有別的專案開啟了 LiveReload！') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + ('未啟動 LiveReload 不會影響其他功能！') + '\n');

        notifier('[開啟 LiveReload] 警告！', '啟動 LiveReload 時發生錯誤', err === null ? '您有其他正在執行 LiveReload 的專案。\n本專案無法執行 LiveReload，但不影響其他功能。' : ('無法執行 LiveReload，不明原因錯誤！\n錯誤原因：' + err));
      } else {
        Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
        openLivereload();
      }

      finish();
    });
  }

  function finish() {
    Ginkgo.print('\n' + Ginkgo.cc(' 【開發工具狀態】', 'y') + '\n');
    Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + 'Watch Icon Fonts' + Ginkgo.cc(' ─ ', 'w0') + (isListenIconFont   ? Ginkgo.cc('已經啟動', 'g') : Ginkgo.cc('尚未啟動', 'r')) + '\n');
    Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + 'Watch Scss Files' + Ginkgo.cc(' ─ ', 'w0') + (isListenScssFile   ? Ginkgo.cc('已經啟動', 'g') : Ginkgo.cc('尚未啟動', 'r')) + '\n');
    Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + 'Watch Livereload' + Ginkgo.cc(' ─ ', 'w0') + (isListenLivereload ? Ginkgo.cc('已經啟動', 'g') : Ginkgo.cc('尚未啟動', 'r')) + '\n');
    
    if (!isListenIconFont && !isListenScssFile && !isListenLivereload)
      return Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + '開發工具沒有開啟..' + '\n');

    Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + Ginkgo.ctrlC());

    Ginkgo.print('\n' + Ginkgo.cc(' 【紀錄】', 'R') + '\n');
    Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + '您可以開始開發囉！' + '\n');
  }
  
  if (first) {
    process.stdout.write('\x1b[2J');
    process.stdout.write('\x1b[0f');
    Ginkgo.print('\n' + Ginkgo.cc(' 【Ginkgo 開發工具】', 'R') + '\n');
    Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + Ginkgo.ctrlC());
  } else {
    Ginkgo.print('\n');
  }
  
  Ginkgo.print('\n' + Ginkgo.cc(' 【監控目錄】', 'y') + '\n');

  watchIconFont();
}

Ginkgo.init(function(inited) {
  Reload    = require('livereload');
  Notifier  = require('node-notifier').NotificationCenter;
  Chokidar  = require('chokidar');
  CmdExists = require('command-exists');

  return main(inited);
}, Ginkgo.cc(' 【Ginkgo 開發工具】', 'R') + '\n'
 + Ginkgo.cc('    ➤ ', 'C')
 + Ginkgo.ctrlC());