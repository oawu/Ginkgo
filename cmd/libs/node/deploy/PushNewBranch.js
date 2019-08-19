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
  Display.line('切換回 ' + Xterm.color.gray(Argv.oriBranch, true) + ' 分支',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git checkout ' + Argv.oriBranch + ' --quiet', true).dim().italic()) &&
  
  Exec('git checkout ' + Argv.oriBranch + ' --quiet', (error, stdout, stderr) => {
    if (error)
      return Display.line(false, error.message)

    if (stdout.length)
      return Display.line(false) || Rollback(['執行指令 git checkout ' + Argv.oriBranch + ' --quiet 失敗！'])

    return Display.line(true) && closure && closure()
  })

const pushBranch = closure => true &&
  Display.line('推送 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支推至 ' + Xterm.color.gray('origin remote', true),
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git push origin ' + Argv.data.goal + ' --force', true).dim().italic()) &&
  
  Exec('git push origin ' + Argv.data.goal + ' --force', (error, stdout, stderr) => {
    if (error)
      return Display.line(false, error.message)

    if (stdout.length)
      return Display.line(false) || Rollback(['執行指令 git push origin ' + Argv.data.goal + ' --force 失敗！'])

    return Display.line(true) && checkoutOriBranch(closure)
  })

const commitWithMessage = closure => true &&
  Display.line('變更紀錄提交 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git commit --message "上傳前壓縮紀錄。" --quiet', true).dim().italic()) &&
  
  Exec('git commit --message "上傳前壓縮紀錄。" --quiet', (error, stdout, stderr) => {
    if (error)
      return Display.line(false, error.message)

    if (stdout.length)
      return Display.line(false) || Rollback(['執行指令 git commit --message "上傳前壓縮紀錄。" --quiet 失敗！'])

    return Display.line(true) && pushBranch(closure)
  })

const addAllModify = closure => true &&
  Display.line('添加變更檔案至 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git add --all', true).dim().italic()) &&

  Exec('git add --all', (error, stdout, stderr) => {
    if (error)
      return Display.line(false, error.message)

    if (stdout.length)
      return Display.line(false) || Rollback(['執行指令 git add --all 失敗！'])

    return Display.line(true) && commitWithMessage(closure)
  })

module.exports = (title, closure) => true &&
  Display.title(title) &&
  Display.line('檢查 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支是否變更',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git status --porcelain', true).dim().italic()) &&

  Exec('git status --porcelain', (error, stdout, stderr) => {
    if (error)
      return Display.line(false, error.message)

      return Display.line(true) && stdout.length
        ? addAllModify(closure)
        : pushBranch(closure)
  })
