/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display = require('../Display')
const Xterm   = require('../Xterm')
const Exec    = require('child_process').exec

module.exports = (title, closure) => true &&

  Display.title(title) &&

  Display.line('檢查是否已經 Commit',
    Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('git status --porcelain', true).dim().italic()) &&

  Exec('git status --porcelain', (error, stdout, stderr) => {
    if (error)
      return Display.line(false, error.message)

    if (stdout.length)
      return Display.line(false, ['此 Git 專案尚未 Commit', '建議先 Commit 後再執行部署比較安全！'])

    return Display.line(true) && closure && closure()
  })
