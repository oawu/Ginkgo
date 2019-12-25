/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path    = require('path')
const Exec    = require('child_process').exec
const Exists  = require('fs').existsSync
const Display = require('../Display')
const Config  = require(Path.config)

const init = closure => Display.linesM('於 dist 目錄內建立 git', ['執行指令', 'cd dist/'], ['執行指令', 'cd dist/ && git init']) &&
  Exists(Path.dist + '.git')
    ? remove(_ => init(closure))
    : Exec('cd ' + Path.dist + ' && git init', (error, stdout, stderr) => error ? Display.line(false, ['初始化失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

const all = closure => Display.linesM('於 dist 目錄內所有檔案加入 git', ['執行指令', 'cd dist/'], ['執行指令', 'cd dist/ && git add --all']) &&
  Exec('cd ' + Path.dist + ' && git add --all', (error, stdout, stderr) => error ? Display.line(false, ['加入檔案失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

const commit = closure => Display.linesM('於 dist 目錄內建立 git commit 紀錄', ['執行指令', 'cd dist/'], ['執行指令', 'cd dist/ && git commit --message "' + Config.github.commitMessage + '"']) &&
  Exec('cd ' + Path.dist + ' && git commit --message "' + Config.github.commitMessage + '" --allow-empty', (error, stdout, stderr) => error ? Display.line(false, ['建立紀錄失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

const push = closure => Display.linesM('於 dist 目錄內 git push 至 github page', ['執行指令', 'cd dist/'], ['執行指令', 'git push --force git@github.com:' + Config.github.account + '/' + Config.github.repository + '.git master:' + Config.github.pageBranch]) &&
  Exec('cd ' + Path.dist + ' && git push --force git@github.com:' + Config.github.account + '/' + Config.github.repository + '.git master:' + Config.github.pageBranch, (error, stdout, stderr) => error ? Display.line(false, ['執行失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

const remove = closure => Display.linesM('於 dist 目錄刪除 git', ['執行指令', 'cd dist/'], ['執行指令', 'rm -rf ' + Path.dist + '.git']) &&
  Exec('cd ' + Path.dist + ' && rm -rf ' + Path.dist + '.git', (error, stdout, stderr) => error ? Display.line(false, ['執行失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

// const status = (closure1, closure2) => Display.linesM('於 dist 目錄檢查 git 狀態', ['執行指令', 'cd dist/'], ['執行指令', 'cd dist/ && git status --porcelain']) &&
//   Exec('cd ' + Path.dist + ' && git status --porcelain', (error, stdout, stderr) => !error
//     ? !stdout.length
//       ? Display.line(true) && typeof closure1 == 'function' && closure1()
//       : Display.line(true) && typeof closure2 == 'function' && closure2()
//     : Display.line(false, ['加入檔案失敗！', '錯誤訊息：' + error.message]))

module.exports = closure => Display.title('部署至 Github Page') &&
  init(_ =>
    all(_ =>
      commit(_ =>
        push(_ =>
          remove(
            closure)))))
  