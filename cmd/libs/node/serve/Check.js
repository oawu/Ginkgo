/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path       = require('path')
const Display    = require('../Display')
const FileSystem = require('fs')
  const Exists   = FileSystem.existsSync
  const ReadFile = FileSystem.readFileSync

const checkConfig = _ => {
  const Config = require(Path.config)
  
  Config.dir = Config.dir || {}
  Config.dirName = Config.dirName || {}
  Config.scss    = Config.scss    || {}
  Config.watch   = Config.watch   || {}
  Config.server  = Config.server  || {}
  Config.compass = Config.compass || {}

  Config.dir.entry            = Config.dir.entry            || 'src'

  Config.dirName.iconDir      = Config.dirName.iconDir      || 'icon'
  Config.dirName.scssDir      = Config.dirName.scssDir      || 'scss'
  Config.dirName.cssDir       = Config.dirName.cssDir       || 'css'
  Config.dirName.imgDir       = Config.dirName.imgDir       || 'img'
  Config.dirName.jsDir        = Config.dirName.jsDir        || 'js'

  Config.scss.iconByGinkgo    = Config.scss.iconByGinkgo    || false

  Config.watch.formats        = Config.watch.formats        || ['.php', '.html', '.css', '.js']
  Config.watch.ignoreDirs     = Config.watch.ignoreDirs     || ['icon']
  Config.watch.runTimer       = Config.watch.runTimer       || 250
  Config.watch.waitTimer      = Config.watch.waitTimer      || 10

  Config.server.https         = Config.server.https         || {}
  Config.server.https.enable  = Config.server.https.enable  || false
  Config.server.https.key     = Config.server.https.key     || null
  Config.server.https.cert    = Config.server.https.cert    || null


  Config.server.domain        = Config.server.domain        || '127.0.0.1'
  Config.server.minPort       = Config.server.minPort       || 8000
  Config.server.maxPort       = Config.server.maxPort       || 8999
  Config.server.defaultPort   = Config.server.defaultPort   || null
  Config.server.utf8Exts      = Config.server.utf8Exts      || ['.html', '.css', '.js', '.json', '.text']

  if (Config.server.maxPort < Config.server.minPort) {
    Config.server.minPort = 8000
    Config.server.maxPort = 8999
  }

  Config.compass.outputStyle  = Config.compass.outputStyle  || 'compact'
  Config.compass.lineComments = Config.compass.lineComments || false
  Config.compass.relative     = typeof Config.compass.relative == 'boolean' ? Config.compass.relative : true
  Config.compass.imports      = Config.compass.imports      || []
  Config.compass.uri          = Config.compass.uri          || Path.basename(Path.root)

  Path.entry  = Path.root + Config.dir.entry.trim(Path.sep) + Path.sep
  Path.icon = Path.entry + Config.dirName.iconDir + Path.sep
  Path.scss = Path.entry + Config.dirName.scssDir + Path.sep
  Path.css  = Path.entry + Config.dirName.cssDir  + Path.sep
  delete Config.dir.entry

  if (Config.server.https.enable) {
    try {
      Config.server.https.key  = Config.server.https.key  ? ReadFile(Path.cmd + 'config' + Path.sep + 'https' + Path.sep + Config.server.https.key) : null
      Config.server.https.cert = Config.server.https.cert ? ReadFile(Path.cmd + 'config' + Path.sep + 'https' + Path.sep + Config.server.https.cert) : null
      Config.server.https.enable = !!(Config.server.https.key && Config.server.https.cert)
    } catch (e) {
      Config.server.https.enable = false
    }
  }

  return true
}

const checkCompass = _ => {
  if (Exists(Path.compass + 'config.rb'))
    return true

  const Config = require(Path.config)
  const relative = Path.relative(Path.compass, Path.entry) + Path.sep
  
  let content = ""
  content += "#" + Display.LN
  content += "# @author      OA Wu <comdan66@gmail.com>" + Display.LN
  content += "# @copyright   Copyright (c) 2015 - 2019, Ginkgo" + Display.LN
  content += "# @license     http://opensource.org/licenses/MIT  MIT License" + Display.LN
  content += "# @link        https://www.ioa.tw/" + Display.LN
  content += "#" + Display.LN
  content += Display.LN
  content += "require 'compass/import-once/activate'" + Display.LN
  
  content += Display.LN
  content += '# 預設編碼' + Display.LN
  content += 'Encoding.default_external = "utf-8"' + Display.LN
  content += Display.LN
  content += '# 網域(domain)後面的目錄' + Display.LN
  content += 'http_path = "/' + Config.compass.uri + '"' + Display.LN
  content += Display.LN

  content += '# 字體目錄與網址下的字體目錄' + Display.LN
  content += 'fonts_dir = "' + Config.dirName.iconDir + '"' + Display.LN
  content += 'fonts_path = "' + relative + Config.dirName.iconDir + '"' + Display.LN
  content += Display.LN
  
  content += '# css 目錄與 scss 目錄' + Display.LN
  content += 'css_dir = "' + relative + Config.dirName.cssDir + '"' + Display.LN
  content += 'sass_dir = "' + relative + Config.dirName.scssDir + '"' + Display.LN
  content += Display.LN
  
  content += '# 圖片目錄與網址下的圖片目錄' + Display.LN
  content += 'images_dir = "' + Config.dirName.imgDir + '"' + Display.LN
  content += 'images_path = "' + relative + Config.dirName.imgDir + '"' + Display.LN
  content += Display.LN
  
  content += '# js 目錄與網址下的 js 目錄，目前沒發現在哪邊用到..' + Display.LN
  content += 'javascripts_dir = "' + Config.dirName.jsDir + '"' + Display.LN
  content += 'javascripts_path = "' + relative + Config.dirName.jsDir + '"' + Display.LN
  content += Display.LN
  
  content += '# 其他要匯入的資源' + Display.LN
  content += '  # add_import_path = "./libs"' + Display.LN
  content += 'additional_import_paths = [' + ['./', relative + 'scss'].concat(Config.compass.imports).map(t => '"' + t + '"').join(', ') + ']' + Display.LN
  content += Display.LN
  
  content += '# 選擇輸出的 css 類型，:expanded or :nested or :compact or :compressed' + Display.LN
  content += '  # nested     有縮排 沒壓縮，會有 @charset "UTF-8";' + Display.LN
  content += '  # expanded   沒縮排 沒壓縮，會有 @charset "UTF-8";' + Display.LN
  content += '  # compact    有換行 有壓縮(半壓縮)，會有 @charset "UTF-8";' + Display.LN
  content += '  # compressed 沒縮排 有壓縮(全壓縮)，沒有 @charset "UTF-8";' + Display.LN
  content += 'output_style = :' + Config.compass.outputStyle + '' + Display.LN
  content += Display.LN
  
  content += '# 在 css 中加入註解相對應於 scss 的第幾行，false、true' + Display.LN
  content += '  # false     不需加入註解' + Display.LN
  content += '  # true      需要加入註解' + Display.LN
  content += 'line_comments = ' + Config.compass.lineComments + '' + Display.LN
  content += Display.LN
  
  content += '# 是否使用相對位置，若是仰賴 http_path 則設為 false' + Display.LN
  content += '  # relative_assets = false' + Display.LN
  content += 'relative_assets = ' + Config.compass.relative + '' + Display.LN

  try { require('fs').writeFileSync(Path.compass + 'config.rb', content, 'utf8') }
  catch (e) { return false }
  return true
}

module.exports = closure => {
  const CmdExists = require('command-exists').sync
  Display.title('檢查開發環境')

  Display.lines('檢查是否有 compass 指令', '執行動作', 'check git compass')
  CmdExists('compass')
    ? Display.line(true, '有')
    : Display.line(false, '找不到 compass 指令，開發過程中會使用到 compass 指令！')

  Display.lines('檢查是否有 PHP 指令', '執行動作', 'check php command')
  CmdExists('php')
    ? Display.line(true, '有')
    : Display.line(false, '找不到 PHP 指令，部署過程中會使用到 PHP 指令！')

  Display.lines('取得開發設定檔', '執行動作', 'read config/serve.js file')
  Exists(Path.config)
    ? Display.line(true)
    : Display.line(false, '尚未設定開發設定檔！')

  Display.lines('檢查 compass 目錄是否存在', '執行動作', 'check ' + Path.relative(Path.root, Path.compass) + ' is exists')
  Exists(Path.compass)
    ? Display.line(true, '存在')
    : Display.line(false, 'compass 目錄不存在！')

  Display.lines('檢查 PHP 主要檔案是否存在', '執行動作', 'check ' + Path.relative(Path.root, Path.phpEntry) + ' is exists')
  Exists(Path.phpEntry)
    ? Display.line(true, '存在')
    : Display.line(false, 'PHP 主要檔案不存在！')

  Display.lines('檢查開發設定檔', '執行動作', 'check config/serve.js file')
  checkConfig()
    ? Display.line(true)
    : Display.line(false, '確認開發設定檔失敗！')

  Display.lines('檢查開發目錄是否存在', '執行動作', 'check ' + Path.relative(Path.root, Path.entry) + Path.sep + ' is exists')
  Exists(Path.entry)
    ? Display.line(true, '存在')
    : Display.line(false, '開發目錄不存在！')

  Display.lines('設定 Compass 設定檔', '執行動作', 'write config.rb file')
  checkCompass()
    ? Display.line(true)
    : Display.line(false, '寫入 Compass 設定檔失敗！')

  return typeof closure == 'function' && closure()
}
