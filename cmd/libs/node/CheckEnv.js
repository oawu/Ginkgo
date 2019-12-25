/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */


let testRequire = _ => {
  const Path = require('path')
  const PackageDist = Path.cmd + 'package.json'
  const PackageSrc = Path.cmd + 'config' + Path.sep + 'package.json'
  
  if (!require('fs').existsSync(PackageDist)) {
    try { require('fs').copyFileSync(PackageSrc, PackageDist) }
    catch (e) { return false }
  }

  try {
    Object.keys(JSON.parse(require('fs').readFileSync(PackageDist, 'utf8')).dependencies).map(require)
    return true
  } catch(error) {
    return false
  }
  return true
}

let installAll = sudo => {
  const Exec = require('child_process').execSync
  try {
    let output = Exec((sudo === 'sudo' ? sudo + ' ' : '') + 'npm install .', { stdio: 'pipe' }).toString()
    return true
  } catch(error) {
    return false
  }
  return true
}

let pass = closure => {
  const Unlink = require('fs').unlink
  const CMD = require('path').cmd
  Unlink(CMD + 'package.json', _ => Unlink(CMD + 'package-lock.json', closure))
}

module.exports = closure => {
  const Display  = require('./Display')
  const Xterm    = require('./Xterm')

  Display.title('檢查 Node.js 環境')

  if (Display.lines('檢查是否已經初始', '檢查動作', 'try package.json dependencies') && testRequire())
    return pass(_ => Display.line(true) && typeof closure == 'function' && closure(closure))
  else
    Display.line(false)

  if (Display.lines('自動初始化', '執行指令', 'npm install .') && installAll())
    return pass(_ => Display.line(true) && typeof closure == 'function' && closure(closure))
  else
    Display.line(false)
  
  if (Display.lines('改用最高權限初始', '執行指令', 'sudo npm install .') && installAll('sudo'))
    return pass(_ => Display.line(true) && typeof closure == 'function' && closure(closure))
  else
    Display.line(false, '請在終端機手動輸入指令 ' + Xterm.color.gray('npm install .', true).blod() + ' 吧！')
}
