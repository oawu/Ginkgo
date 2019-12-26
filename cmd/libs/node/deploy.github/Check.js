/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path    = require('path')
const Exists  = require('fs').existsSync
const Display = require('../Display')

const checkConfig = _ => {
  const errors = []
  const Config = require(Path.config)

  Config.dir = Config.dir || {}
  Config.dir.dest = Config.dir.dest || 'dest'

  Config.github = Config.github || {}
  Config.github.account       = Config.github.account       || ''
  Config.github.repository    = Config.github.repository    || ''
  Config.github.commitMessage = Config.github.commitMessage || '🚀 部署！'
  Config.github.pageBranch    = Config.github.pageBranch    || 'gh-pages'
  
  Config.github.commitMessage || errors.push('尚未設定 github commit 訊息')
  Config.github.pageBranch    || errors.push('尚未設定 github 靜態頁面分支')

  Config.startAt = new Date().getTime()
  
  Path.dest = Path.root + Config.dir.dest.trim(Path.sep) + Path.sep
  delete Config.dir.dest
  

  if (!errors.length && Config.github.account && Config.github.repository)
    return errors

  try {
    let output = require('child_process').execSync('git remote get-url origin', { stdio: 'pipe' }).toString()
    
    let match = /^git@github\.com:(?<account>.*)\/(?<repository>.*)\.git/gi.exec(output) || /^https:\/\/github\.com\/(?<account>.*)\/(?<repository>.*)\.git/gi.exec(output)

    if (!match)
      throw new Error('此專案非 Github 並且沒有設定資訊');

    Config.github.account    = match.groups.account
    Config.github.repository = match.groups.repository

    return errors
  } catch(e) {
    Config.github.account    || errors.push('尚未設定 github 帳號')
    Config.github.repository || errors.push('尚未設定 github 專案名稱(repository)')
    errors.push('無法取得專案內的 Github 資訊！')
    errors.push(e.message)
    return errors
  }
}

module.exports = closure => {
  const CmdExists = require('command-exists').sync

  Display.title('檢查部署環境')
  
  Display.lines('檢查是否有 Git 指令', '執行動作', 'check git command')
  CmdExists('git')
    ? Display.line(true, '有')
    : Display.line(false, '找不到 Git 指令，部署過程中會使用到 Git 指令！')

  Display.lines('取得部署設定檔', '執行動作', 'read config/deploy.github.js file')
  Exists(Path.config)
    ? Display.line(true)
    : Display.line(false, '尚未設定部署設定檔！')
  
  Display.lines('檢查部署設定檔', '執行動作', 'check config/deploy.github.js file')
  const error = checkConfig()
  error.length
    ? Display.line(false, ['確認設定檔失敗！'].concat(error))
    : Display.line(true)

  Display.lines('檢查部署目錄是否存在', '執行動作', 'check ' + Path.relative(Path.root, Path.dest) + Path.sep + ' is exists')
  Exists(Path.dest)
    ? Display.line(true, '存在')
    : Display.line(false, '部署目錄不存在！')

  return typeof closure == 'function' && closure()
}
