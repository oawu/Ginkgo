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

  Display.lines('檢查是否已經 Commit',
    ['執行指令', 'git status --porcelain']) &&

  Exec('git status --porcelain',
    (error, stdout, stderr) => !error
      ? stdout.length
        ? Display.line(false, ['此 Git 專案尚未 Commit！', '建議先 Commit 後再執行部署比較安全！'])
        : Display.line(true) && closure && closure()
      : Display.line(false, ['執行指令 git status --porcelain 失敗！', '相關原因：' + error.message]))
