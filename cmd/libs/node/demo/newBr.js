/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Ginkgo = require('../Ginkgo');
const Exec = require('child_process').exec;

function checkoutBr(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '分支切換至 ' + Ginkgo.cc(_v.cho.branchName(), 'w2') + ' 分支';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  Exec('git checkout ' + _v.cho.branchName() + ' --quiet', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git checkout ' + _v.cho.branchName() + ' --quiet', 'w2') + ' 失敗！' + '\n\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return closure(_v.cho);
  });
}

function createBr(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '新增本地端 ' + Ginkgo.cc(_v.cho.branchName(), 'w2') + ' 分支';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));
  
  Exec('git branch --verbose ' + _v.cho.branchName(), function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git branch --verbose ' + _v.cho.branchName(), 'w2') + ' 失敗！' + '\n\n');
    
    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return checkoutBr(_v, closure);
  });
}

function deleteBr(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '刪除本地端 ' + Ginkgo.cc(_v.cho.branchName(), 'w2') + ' 分支';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  Exec('git branch --delete --force ' + _v.cho.branchName(), function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (!stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git branch --delete --force ' + _v.cho.branchName(), 'w2') + ' 失敗！' + '\n\n');
    
    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');
    
    return createBr(_v, closure);
  });
}

module.exports.run = function(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '檢查本地端 ' + Ginkgo.cc(_v.cho.branchName(), 'w2') + ' 分支';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  Exec('git branch --list', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (!stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git branch --list', 'w2') + ' 失敗！' + '\n\n');

    const branches = stdout.split('\n').map(Function.prototype.call, String.prototype.trim).filter(function(t) { return t !== ''; });

    _v.gitOri.branch = branches.filter(function(t) { return t.match(/^\*\s+/g); });

    if (!_v.gitOri.branch.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc('取不到目前的分支名稱', 'w2') + '\n\n');
    
    _v.gitOri.branch = _v.gitOri.branch.shift().replace(/^\*\s+/g, '');
    
    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return branches.indexOf(_v.cho.branchName()) === -1 ? createBr(_v, closure) : deleteBr(_v, closure);
  });
}