/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const FileSystem = require('fs')

let App      = null
let Color    = null
let Progress = null

const installAll = (Exec, who) => {
  try { return Exec((who ? who + ' ' : '') + 'npm install .', { stdio: 'pipe' }).toString(), null }
  catch (error) { return error }
  return null
}

let pass = closure => {
  const packageDist = App.path('cmd') + 'package.json'
  const packageLockDist = App.path('cmd') + 'package-lock.json'

  return FileSystem.existsSync(packageDist) || FileSystem.existsSync(packageLockDist)
    ? !FileSystem.existsSync(packageDist) || !FileSystem.existsSync(packageLockDist)
      ? FileSystem.existsSync(packageDist)
        ? FileSystem.unlink(packageDist, closure)
        : FileSystem.unlink(packageLockDist, closure)
      : FileSystem.unlink(packageDist, _ => FileSystem.unlink(packageLockDist, closure))
    : closure()
}

module.exports = (app, closure)=> {
  App = app, Color = App.color, Progress = App.progress
  
  process.stdout.write("\n" + ' ' + Color.yellow('【檢查 Node.js 環境】') + "\n")

  Progress.doing('檢查是否已經初始', Progress.cmd('檢查動作', 'try package.json dependencies'))
  Progress.total(1)

  const packageDist = App.path('cmd') + 'package.json'
  const packageSrc = App.path('cfg') + 'package.json'
  
  if (!FileSystem.existsSync(packageDist)) {
    try { FileSystem.copyFileSync(packageSrc, packageDist) }
    catch (e) { return Progress.failure(null, e) }
  }

  try { Object.keys(JSON.parse(FileSystem.readFileSync(packageDist, 'utf8')).dependencies).map(require) }
  catch (e) {
    Progress.failure(null)

    Progress.doing('自動初始化', Progress.cmd('執行指令', 'npm install .'))
    Progress.total(1)

    const Exec = require('child_process').execSync
    let error = installAll(Exec)
    if (!error)
      return Progress.success(), pass(closure)
    Progress.failure(null)

    Progress.doing('改用最高權限初始', Progress.cmd('執行指令', 'sudo npm install .'))

    error = installAll(Exec, 'sudo')
    return !error
      ? (Progress.success(), pass(closure))
      : Progress.failure(null, '請手動輸入指令 ' + Color.gray('npm install .', true).blod() + ' 吧！', error)
  }

  Progress.success()
  return pass(closure)
}
