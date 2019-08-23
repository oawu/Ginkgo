/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display = require('../Display')
const Xterm   = require('../Xterm')
const Argv    = require('./Argv')
const Exec    = require('child_process').exec

const setGithubUri = stdout => {
  let uris = []

  if (stdout.match(/^git@github\.com:(.*)\/(.*)\.git/gi)) {
    stdout = stdout.split(/^git@github\.com:(.*)\/(.*)\.git/g).map(t => t.trim()).filter(t => t !== '')
    if (stdout.length == 2)
      uris = stdout
  } else if (stdout.match(/^https:\/\/github\.com\/.*\/.*\.git/gi)) {
    stdout = stdout.split(/^https:\/\/github\.com\/(.*)\/(.*)\.git/g).map(t => t.trim()).filter(t => t !== '')
    if (stdout.length == 2)
      uris = stdout
  } else {
    uris = []
  }

  if (uris.length != 2)
    return false

  Argv.githubUris = uris

  return true
}

module.exports = (title, closure) => true &&
  Display.title(title) &&

  Display.lines('檢查專案是否為 ' + Xterm.color.gray('GitHub', true) + ' 專案',
    ['執行動作', 'check .git origin remote url']) &&

  Exec('git remote get-url origin',
    (error, stdout, stderr) => !error
      ? stdout.length
        ? setGithubUri(stdout)
          ? Display.line(true) && closure && closure()
          : Display.line(false, ['執行指令 git remote get-url origin 失敗！', '請確認專案內有 origin remote url，其 remote url 應為 git@github.com 或 https://github.com/ 開頭！'])
        : Display.line(false, ['執行指令 git remote get-url origin 失敗！', '相關原因：' + '無法取得 GitHub remote RUL'])
      : Display.line(false, ['執行指令 git remote get-url origin 失敗！', '相關原因：' + error.message]))
