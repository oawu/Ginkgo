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
  Display.lines('分支切換回 ' + Xterm.color.gray(Argv.oriBranch, true) + ' 分支',
    ['執行指令', 'git checkout ' + Argv.oriBranch + ' --quiet']) &&

  Exec('git checkout ' + Argv.oriBranch + ' --quiet',
    (error, stdout, stderr) => !error
      ? stdout.length
        ? Display.line(false, ['執行指令 git checkout ' + Argv.oriBranch + ' --quiet 失敗！', '請記得手動將分支設定回 ' + Xterm.color.gray(Argv.oriBranch, true)])
        : Display.line(true) && print(Display.LN) && print(Display.LN)
      : Display.line(false, ['相關原因：' + error.message, '請記得手動將分支設定回 ' + Xterm.color.gray(Argv.oriBranch, true)]))

const gitClear = () => true &&
  Display.lines('清除與恢復修改',
    ['執行指令', 'git checkout .. --quiet']) &&

  Exec('git checkout .. --quiet',
    (error, stdout, stderr) => !error
      ? stdout.length
        ? Display.line(false, ['執行指令 git checkout .. --quiet 失敗！', '請記得手動將分支設定回 ' + Xterm.color.gray(Argv.oriBranch, true)])
        : Display.line(true) && checkoutOriBranch()
      : Display.line(false, ['相關原因：' + error.message, '請記得手動將分支設定回 ' + Xterm.color.gray(Argv.oriBranch, true)]))

module.exports = messages => true &&
  print(messages.length
    ? Display.LN + ' ' + Xterm.color.red('【錯誤訊息】') + Display.LN + messages.map(error => ' '.repeat(3) + Display.markList() + ' ' + error.replace(Display.LN, '') + Display.LN).join('')
    : Display.LN + ' ' + Xterm.color.red('【退回原本分支】') + Display.LN) &&

  gitClear()
