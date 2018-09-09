/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Ginkgo = require('../Ginkgo');
const Exec = require('child_process').exec;


function checkoutBr(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '切換至 ' + Ginkgo.cc(_v.gitOri.branch, 'w2') + ' 分支';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  Exec('git checkout ' + _v.gitOri.branch + ' --quiet', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git checkout ' + _v.gitOri.branch + ' --quiet', 'w2') + ' 失敗！' + '\n\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return closure();
  });
}

function pushBr(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '推送 ' + Ginkgo.cc(_v.cho.branchName(), 'w2') + ' 分支至 ' + Ginkgo.cc('origin', 'w2') + ' remote';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));
  
  Exec('git push origin ' + _v.cho.branchName() + ' --force', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git push origin ' + _v.cho.branchName() + ' --force', 'w2') + ' 失敗！' + '\n\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return checkoutBr(_v, closure);
  });
}

function commitBr(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '變更提交 ' + Ginkgo.cc(_v.cho.branchName(), 'w2') + ' 分支';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));
  
  Exec('git commit --message "上傳前壓縮紀錄。" --quiet', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git commit --message "上傳前壓縮紀錄。" --quiet', 'w2') + ' 失敗！' + '\n\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return pushBr(_v, closure);
  });
}

function addAllBr(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '紀錄變更 ' + Ginkgo.cc(_v.cho.branchName(), 'w2') + ' 分支';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));
  
  Exec('git add --all', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    if (stdout.length)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '不明原因錯誤！' + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '執行指令 ' + Ginkgo.cc('git add --all', 'w2') + ' 失敗！' + '\n\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return commitBr(_v, closure);
  });
}

module.exports.run = function(_v, closure) {
  const title = Ginkgo.cc('    ➤ ', 'C') + '檢查是否有變更';
  Ginkgo.print(title + Ginkgo.cc('… ', 'w0'));

  Exec('git status --porcelain', function(err, stdout, stderr) {
    if (err)
      return Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('失敗', 'r') + '\n' + '     ' + Ginkgo.cc(' ◎ ', 'p2') + '錯誤原因：' + Ginkgo.cc(err, 'w2') + '\n\n');

    Ginkgo.print(title + Ginkgo.cc(' ─ ', 'w0') + Ginkgo.cc('成功', 'g') + '\n');

    return stdout.length ? addAllBr(_v, closure) : pushBr(_v, closure);
  });
};