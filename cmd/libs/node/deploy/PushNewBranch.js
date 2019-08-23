/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display  = require('../Display')
const Xterm    = require('../Xterm')
const Rollback = require('./Rollback')
const Argv     = require('./Argv')
const Exec     = require('child_process').exec

const checkoutOriBranch = closure => true &&
  Display.lines('切換回 ' + Xterm.color.gray(Argv.oriBranch, true) + ' 分支',
    ['執行指令', 'git checkout ' + Argv.oriBranch + ' --quiet']) &&
  
  Exec('git checkout ' + Argv.oriBranch + ' --quiet',
    (error, stdout, stderr) => !error
      ? stdout.length
        ? Display.line(false) || Rollback(['執行指令 git checkout ' + Argv.oriBranch + ' --quiet 失敗！'])
        : Display.line(true) && closure && closure()
      : Display.line(false) || Rollback(['相關原因：' + error.message]))

const pushBranch = closure => true &&
  Display.lines('推送 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支推至 ' + Xterm.color.gray('origin remote', true),
    ['執行指令', 'git push origin ' + Argv.data.goal + ' --force']) &&
  
  Exec('git push origin ' + Argv.data.goal + ' --force',
    (error, stdout, stderr) => !error
      ? stdout.length
        ? Display.line(false) || Rollback(['執行指令 git push origin ' + Argv.data.goal + ' --force 失敗！'])
        : Display.line(true) && checkoutOriBranch(closure)
      : Display.line(false) || Rollback(['相關原因：' + error.message]))

const commitWithMessage = closure => true &&
  Display.lines('變更紀錄提交 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支',
    ['執行指令', 'git commit --message "上傳前壓縮紀錄。" --quiet']) &&
  
  Exec('git commit --message "上傳前壓縮紀錄。" --quiet',
    (error, stdout, stderr) => !error
      ? stdout.length
        ? Display.line(false) || Rollback(['執行指令 git commit --message "上傳前壓縮紀錄。" --quiet 失敗！'])
        : Display.line(true) && pushBranch(closure)
      : Display.line(false) || Rollback(['相關原因：' + error.message]))

const addAllModify = closure => true &&
  Display.lines('添加變更檔案至 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支',
    ['執行指令', 'git add --all']) &&

  Exec('git add --all',
    (error, stdout, stderr) => !error
      ? stdout.length
        ? Display.line(false) || Rollback(['執行指令 git add --all 失敗！'])
        : Display.line(true) && commitWithMessage(closure)
      : Display.line(false) || Rollback(['相關原因：' + error.message]))

module.exports = (title, closure) => true &&
  Display.title(title) &&
  Display.lines('檢查 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支是否變更',
    ['執行指令', 'git status --porcelain']) &&

  Exec('git status --porcelain',
    (error, stdout, stderr) => !error 
      ? Display.line(true) && stdout.length
        ? addAllModify(closure)
        : pushBranch(closure)
      : Display.line(false) || Rollback(['相關原因：' + error.message]))
