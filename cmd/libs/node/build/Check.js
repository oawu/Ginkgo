/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path    = require('path')
const Exists  = require('fs').existsSync
const Display = require('../Display')
const Xterm   = require('../Xterm')

const getEnv = argvs => {
  for(let i = 0; i < argvs.length; i++)
    if (['-e', '--env'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-' && ['Development', 'Testing', 'Staging', 'Production'].indexOf(argvs[i + 1]) !== -1)
        return argvs[i + 1]
  return null
}

const checkConfig = _ => {
  const errors = []
  const Config = require(Path.config)

  Config.dir = Config.dir || {}
  Config.dir.dest  = Config.dir.dest  || 'dist'
  Config.dir.entry = Config.dir.entry || 'src'

  Config.minify = typeof Config.minify == 'boolean' ? Config.minify : true
  Config.allowExts = Config.allowExts || []
  Config.ignorePermission = Config.ignorePermission || false
  Config.startAt = new Date().getTime()

  Path.dest = Path.root + Config.dir.dest.trim(Path.sep) + Path.sep
  delete Config.dir.dest

  Path.entry = Path.root + Config.dir.entry.trim(Path.sep) + Path.sep
  delete Config.dir.entry

  return errors
}

module.exports = closure => {
  const CmdExists = require('command-exists').sync
  
  Display.title('檢查編譯環境')

  Display.lines('檢查是否有 PHP 指令', '執行動作', 'check php command')
  CmdExists('php')
    ? Display.line(true, '有')
    : Display.line(false, '找不到 PHP 指令，編譯過程中會使用到 PHP 指令！')

  Display.lines('檢查 PHP 進入點是否存在', '執行動作', 'check php entry file')
  Exists(Path.phpEntry)
    ? Display.line(true)
    : Display.line(false, '找不到 PHP 進入點的檔案，請檢查「' + Path.phpEntry + '」是否存在！')
  
  Display.lines('取得編譯設定檔', '執行動作', 'read config/build.js file')
  Exists(Path.config)
    ? Display.line(true)
    : Display.line(false, '尚未設定編譯設定檔！')
  
  Display.lines('檢查 PHP 主要檔案是否存在', '執行動作', 'check ' + Path.relative(Path.root, Path.phpEntry) + ' is exists')
  Exists(Path.phpEntry)
    ? Display.line(true, '存在')
    : Display.line(false, 'PHP 主要檔案不存在！')

  Display.lines('檢查編譯設定檔', '執行動作', 'check config/build.js file')
  const error = checkConfig()
  error.length
    ? Display.line(false, ['確認設定檔失敗！'].concat(error))
    : Display.line(true)

  Display.lines('檢查開發目錄是否存在', '執行動作', 'check ' + Path.relative(Path.root, Path.entry) + Path.sep + ' is exists')
  Exists(Path.entry)
    ? Display.line(true, '存在')
    : Display.line(false, '開發目錄不存在！')

  Display.lines('取得參數', '執行動作', 'get argvs')
  const Config = require(Path.config)
  Config.argvs = process.argv.slice(2)
  Display.line(true)

  return typeof closure == 'function' && closure()
}
