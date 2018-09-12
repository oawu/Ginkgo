/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Util = require('util');
const Path = require('path');
const Exec = require('child_process').exec;
const FileSystem  = require('fs');

var cc = function(str, fontColor, backgroundColor, options) {
  if (str === '')
    return '';

  const colors = { n: '30', r: '31', g: '32', y: '33', b: '34', p: '35', c: '36', w: '37' };
  const styles = { underline: '4', blink: '5', reverse: '7', hidden: '8', u: '4', b: '5', r: '7', h: '8' };

  let tmps = [];

  if (typeof options === 'undefined')
    options = [];

  if (typeof options === 'string')
    options = options.split(',').map(Function.prototype.call, String.prototype.trim);
  
  if (Array.isArray(options) && (options = options.map(Function.prototype.call, String.prototype.toLowerCase)).length)
    for(let i = 0; i < options.length; i++)
      if (typeof styles[options[i]] !== 'undefined')
        tmps.push(['\033[' + styles[options[i]] + 'm', '\033[0m']);

  if (typeof backgroundColor !== 'undefined') {
    let c = backgroundColor[0].toLowerCase();
    if (typeof colors[c] !== 'undefined')
      tmps.push(['\033[' + (parseInt(colors[c], 10) + 10) + 'm', '\033[0m']);
  }

  if (typeof fontColor !== 'undefined') {
    if (fontColor.length < 2)
      fontColor += '_';

    let c = fontColor[0], w = fontColor[1];

    w = w === '_' ? c === c.toUpperCase() ? '2' : w : w;
    c = c.toLowerCase();

    if (!['0', '1', '2'].includes(w))
      w = '1';

    w = w !== '0' ? w === '1' ? '0' : '1' : '2';

    if (typeof colors[c] !== 'undefined')
    tmps.push(['\033[' + w + ';' + colors[c] + 'm', '\033[0m']);
  }

  for(let i = 0; i < tmps.length; i++)
    str = tmps[i][0] + str + tmps[i][1];

  return str;
};

var print = function() {
  process.stdout.write('\r' + Util.format.apply(this, Array.prototype.slice.call(arguments)));
};

var ctrlC = function() {
  return '過程中若要關閉請直接按鍵盤上的 ' + cc('control', 'W') + cc(' + ', 'w0') + cc('c', 'W') + '\n' + '                                     ' + cc('^^^^^^^^^^^', 'c1');
};

var init = function(closure, header) {
  try {
    require('livereload');
    require('node-notifier');
    require('chokidar');
    require('command-exists');

    return closure(true);
  } catch(e) {
    if (!(e + '').match(/Error: Cannot find module/))
      return console.error(e);
    
    process.stdout.write('\x1b[2J');
    process.stdout.write('\x1b[0f');

    print('\n' + header);
    print('\n' + cc(' 【建立環境】', 'y') + '\n');
    
    const title = cc('    ➤ ', 'C') + '執行 ' + cc('npm install .', 'w2') + ' 指令';
    print(title + cc('… ', 'w0'));

    Exec('npm install .', function(err, stdout, stderr) {
      const ok = '\n' + '\n' + cc('                                             ', 'r', 'r') + '\n' + cc(' 完成！ ', 'y2', 'r') + cc('已完成初始化環境！                   ', 'n1', 'r') + '\n' + cc('        ', 'y2', 'r') + cc('接著請再執行一次', 'n1', 'r') + cc(' node watch ', 'w2', 'r') + cc('指令吧！ ', 'n1', 'r') + '\n' + cc('                         ', 'r', 'r') + cc('^^^^^^^^^^', 'y2', 'r') + cc('          ', 'r', 'r') + '\n' + '\n';
      const no = '\n' + '\n' + cc('                                            ', 'r', 'r') + '\n' + cc(' 失敗！ ', 'y2', 'r') + cc('不明原因錯誤！                      ', 'n1', 'r') + '\n' + cc('        ', 'y2', 'r') + cc('請在手動執行指令', 'n1', 'r') + cc(' npm install . ', 'w2', 'r') + cc('吧！ ', 'n1', 'r') + '\n' + cc('                         ', 'r', 'r') + cc('^^^^^^^^^^^^^', 'y2', 'r') + cc('      ', 'r', 'r') + '\n' + '\n';

      if (!err) {
        try {
          require('livereload');
          require('node-notifier');
          require('chokidar');
          require('command-exists');

          print(title + cc(' ─ ', 'w0') + cc('成功', 'g'));
          return closure(false);
        } catch(e) {
          if (!(e + '').match(/Error: Cannot find module/))
            return console.error(e);

          return print(no) && process.exit(1);
        }
      }

      print(title + cc(' ─ ', 'w0') + cc('警告', 'y') + '\n');
      print('     ' + cc(' ◎ ', 'p2') + cc('cmd 目錄', 'w2') + '權限不可寫入' + '\n');
      print(cc('    ➤ ', 'C') + '改使用最高權限執行 ' + cc('sudo npm install .', 'w2') + ' 指令' + '\n');
      
      Exec('sudo npm install .', function(err, stdout, stderr) {
        if (!err) {
          try {
            require('livereload');
            require('node-notifier');
            require('chokidar');
            require('command-exists');

            return closure(false);
          } catch(e) {
            if (!(e + '').match(/Error: Cannot find module/))
              return console.error(e);

            return print(no) && process.exit(1);
          }
        }

        return print(no) && process.exit(1);
      });
    });
  }
};

var question = function(items, closure) {
  const readline = require('readline').createInterface;
  const rl = readline({ input: process.stdin, output: process.stdout });

  rl.question(cc(' ➜', 'r2') + ' 請輸入您的選項：', function(answer) {
    rl.close();

    cho = answer.toLowerCase().trim();

    if (items.indexOf(cho) === -1)
      return question(items, closure);

    closure(cho);
  });
};

var mapDir = function(dir, filelist) {
  const cmd = Path.resolve(__dirname, '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + 'cmd');
  const files = FileSystem.readdirSync(dir);

  filelist = filelist || [];
  files.forEach(function(file) {
    if (FileSystem.statSync(dir + file).isDirectory()) {
      if (!(dir + file + Path.sep).match(cmd))
        filelist = mapDir(dir + file + Path.sep, filelist);
    }
    else
      filelist.push(dir + file);
  });
  return filelist;
};

module.exports = {
  cc: cc,
  print: print,
  ctrlC: ctrlC,
  init: init,
  question: question,
  mapDir: mapDir,
};