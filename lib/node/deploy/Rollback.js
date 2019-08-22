/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const print   = require('../Ginkgo').print
const Display = require('../Display')
const Xterm   = require('../Xterm')
const Argv    = require('./Argv')
const Exec    = require('child_process').exec

const checkoutOriBranch = () => true &&
  Display.line('分支切換回 ' + Xterm.color.gray(Argv.oriBranch, true) + ' 分支',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git checkout ' + Argv.oriBranch + ' --quiet', true).dim().italic()) &&

  Exec('git checkout ' + Argv.oriBranch + ' --quiet', (error, stdout, stderr) => {
    if (error)
      return Display.line(false, [error.message, '請記得手動將分支設定回 ' + Xterm.color.gray(Argv.oriBranch, true)])

    if (stdout.length)
      return Display.line(false, ['執行指令 git checkout ' + Argv.oriBranch + ' --quiet 失敗！', '請記得手動將分支設定回 ' + Xterm.color.gray(Argv.oriBranch, true)])

    return Display.line(true) && print(Display.LN) && print(Display.LN)
  })

const gitClear = () => true &&
  Display.line('清除與恢復修改',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git checkout .. --quiet', true).dim().italic()) &&

  Exec('git checkout .. --quiet', (error, stdout, stderr) => {
    if (error)
      return Display.line(false, [error.message, '請記得手動將分支設定回 ' + Xterm.color.gray(Argv.oriBranch, true)])

    if (stdout.length)
      return Display.line(false, ['執行指令 git checkout .. --quiet 失敗！', '請記得手動將分支設定回 ' + Xterm.color.gray(Argv.oriBranch, true)])

    return Display.line(true) && checkoutOriBranch()
  })

module.exports = messages => {

  if (messages.length) {
    print(Display.LN + ' ' + Xterm.color.red('【錯誤訊息】') + Display.LN)
    print(messages.map(error => ' '.repeat(3) + Display.markList() + ' ' + error.replace('\n', '') + Display.LN).join(''))
  }

  print(Display.LN + ' ' + Xterm.color.red('【退回原本分支】') + Display.LN)
  
  return gitClear()
}
