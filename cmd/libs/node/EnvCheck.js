/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display = require('./Display')
const Xterm   = require('./Xterm')

let testRequire = () => {
  try {
    Object.keys(JSON.parse(require('fs').readFileSync(require('path').cmd + 'package.json', 'utf8')).dependencies).map(require)
    return true
  } catch(error) {
    return false
  }
  return true
}

let installAll = () => {
  try {
    let output = require('child_process').execSync('npm install .', { stdio: 'pipe' }).toString()
    return true
  } catch(error) {
    return false
  }
  return true
}

let sudoInstallAll = () => {
  try {
    let output = require('child_process').execSync('sudo npm install .', { stdio: 'pipe' }).toString()
    return true
  } catch(error) {
    return false
  }
  return true
}

module.exports = (title, checkPlugin, closure) => {
  Display.title(title)

  Display.line('檢查是否已經初始', Xterm.color.gray('檢查動作', true).dim() + Display.markSemicolon() + Xterm.color.gray('try package.json dependencies', true).dim().italic())
  if (testRequire())
    return Display.line(true) && checkPlugin && checkPlugin(closure)
  Display.line(false)

  Display.line('自動初始化', Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('npm install .', true).dim().italic())
  if (installAll())
    return Display.line(true) && checkPlugin && checkPlugin(closure)
  Display.line(false)

  Display.line('改用最高權限初始', Xterm.color.gray('執行指令', true).dim() + Display.markSemicolon() + Xterm.color.gray('sudo npm install .', true).dim().italic())
  if (sudoInstallAll())
    return Display.line(true) && checkPlugin && checkPlugin(closure)
  Display.line(false, ['請在終端機手動輸入指令 ' + Xterm.color.gray('npm install .', true).blod() + ' 吧！'])
}
