/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display = require('../Display')
const Xterm   = require('../Xterm')
const Argv    = require('./Argv')
const Exec    = require('child_process').exec

const setGitOriBranch = (branches, stdout) => {
  let branch = branches.filter(t => t.match(/^\*\s+/g))

  if (!branch.length)
    return false

  branch = branch.shift().replace(/^\*\s+/g, '')

  if (!branch.length)
    return false

  Argv.oriBranch = branch

  return true
}

const checkoutBranch = closure => true &&

  Display.line('分支切換至 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git checkout ' + Argv.data.goal + ' --quiet', true).dim().italic()) &&

  Exec('git checkout ' + Argv.data.goal + ' --quiet', (error, stdout, stderr) => {
    if (error)
      return Display.line(false, error.message)

    if (stdout.length)
      return Display.line(false, '執行指令 git checkout ' + Argv.data.goal + ' --quiet 失敗！')

    return Display.line(true) && closure && closure(closure)
  })

const createBranch = closure => true &&

  Display.line('新增本地端 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git branch --verbose ' + Argv.data.goal, true).dim().italic()) &&

  Exec('git branch --verbose ' + Argv.data.goal, (error, stdout, stderr) => {
    if (error)
      return Display.line(false, error.message)

    if (stdout.length)
      return Display.line(false, '執行指令 git branch --verbose ' + Argv.data.goal + ' 失敗！')

    return Display.line(true) && checkoutBranch(closure)
  })

const delectBranch = closure => true &&

  Display.line('刪除本地端 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git branch --delete --force ' + Argv.data.goal, true).dim().italic()) &&

  Exec('git branch --delete --force ' + Argv.data.goal, (error, stdout, stderr) => {
    if (error)
      return Display.line(false, error.message)

    if (!stdout.length)
      return Display.line(false, '執行指令 git branch --delete --force ' + Argv.data.goal + ' 失敗！')

    return Display.line(true) && createBranch(closure)
  })

module.exports = (title, closure) => true &&
  Display.title(title) &&
  
  Display.line('檢查本地端 ' + Xterm.color.gray(Argv.data.goal, true) + ' 分支',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git branch --list', true).dim().italic()) &&

  Exec('git branch --list', (error, stdout, stderr) => {
    if (error)
      return Display.line(false, error.message)

    if (!stdout.length)
      return Display.line(false, '執行指令 git branch --list 失敗！')

    let branches = stdout.split(Display.LN).map(t => t.trim()).filter(t => t !== '')
    
    if (!setGitOriBranch(branches, stdout))
      return Display.line(false, '取不到目前的分支名稱')

    return Display.line(true) && branches.map(t => t.replace(/^\*\s+/g, '')).indexOf(Argv.data.goal) === -1
      ? createBranch(closure)
      : delectBranch(closure)
  })
