/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Ginkgo = require('../Ginkgo');
const CmdExists = require('command-exists');
const Exec = require('child_process').exec;

function checkPhpCmd(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '檢查專案是否有 ' + Ginkgo.cc('PHP', 'w2') + ' 指令';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  CmdExists('php', function(err, exists) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if(!exists)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '無法執行 ' + Ginkgo.cc('PHP', 'w2') + ' 指令。' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '請確認終端機是否可以執行 php 指令。' + '\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return closure(_v.cho);
  });
}

function checkRemoteOriginUrl(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '檢查專案是否為 ' + Ginkgo.cc('GitHub', 'w2') + ' 的專案';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));
  
  Exec('git remote get-url origin', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');
    
    if (!stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git remote get-url origin', 'w2') + ' 失敗！' + '\n\n');

    
    _v.gitOri.url = [];
    if (stdout.match(/^git@github\.com:(.*)\/(.*)\.git/gi)) {
      stdout = stdout.split(/^git@github\.com:(.*)\/(.*)\.git/g).map(Function.prototype.call, String.prototype.trim).filter(function(t) { return t !== ''; })
      if (stdout.length == 2)
        _v.gitOri.url = stdout;
    } else if (stdout.match(/^https:\/\/github\.com\/.*\/.*\.git/gi)) {
      stdout = stdout.split(/^https:\/\/github\.com\/(.*)\/(.*)\.git/g).map(Function.prototype.call, String.prototype.trim).filter(function(t) { return t !== ''; })
      if (stdout.length == 2)
        _v.gitOri.url = stdout;
    }

    if (!_v.gitOri.url.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '找不到你的 ' + Ginkgo.cc('origin remote url', 'w2') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '請確認專案內有 ' + Ginkgo.cc('origin', 'w2') + ' remote' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '以及其 url 為 ' + Ginkgo.cc('git@github.com', 'w2') + ' 或 ' + Ginkgo.cc('https://github.com/', 'w2') + ' 開頭！' + '\n\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
    
    return closure(_v.cho);
  });
}

function checkGitStatus(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '檢查專案狀態是否已經 ' + Ginkgo.cc('Commit', 'w2') + '';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  Exec('git status --porcelain', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '此專案尚未做 Git Commit。' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '請檢查哪些檔案有變更但尚未紀錄。' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '建議先執行以下指令：' + '\n' + '       ' + Ginkgo.cc(' ➜ ', 'g2') + '紀錄變更，指令：' + Ginkgo.cc('git add --all', 'w2') + '\n' + '       ' + Ginkgo.cc(' ➜ ', 'g2') + '再做提交，指令：' + Ginkgo.cc('git commit --message "你的訊息"', 'w2') + '\n' + '       ' + Ginkgo.cc(' ➜ ', 'g2') + '重新執行，指令：' + Ginkgo.cc('node demo', 'w2') + '\n\n');
    
    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return _v.cho.goal == '1' ? checkRemoteOriginUrl(_v, closure) : checkPhpCmd(_v, closure);
  });
}

module.exports.run = function(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '檢查專案是否有 ' + Ginkgo.cc('Git', 'w2') + ' 指令';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  CmdExists('git', function(err, exists) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if(!exists)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '無法執行 ' + Ginkgo.cc('Git', 'w2') + ' 指令。' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '請確認終端機是否可以執行 git 指令。' + '\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return checkGitStatus(_v, closure);
  });
};