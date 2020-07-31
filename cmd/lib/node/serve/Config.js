/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2020, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const FileSystem = require('fs')

let App      = null
let Progress = null
let Path     = null

const getArgv = keys => {
  const argvs = process.argv.slice(2)
  for(let i = 0; i < argvs.length; i++)
    if (keys.indexOf(argvs[i]) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        return argvs[i + 1]
  return null
}

const checkCompass = _ => {
  if (FileSystem.existsSync(App.path('lib-scss') + 'config.rb'))
    return true

  const relative = Path.relative(App.path('lib-scss'), App.path('entry')) + Path.sep
  const contents = []

  contents.push('#')
  contents.push('# @author      OA Wu <comdan66@gmail.com>')
  contents.push('# @copyright   Copyright (c) 2015 - 2020, Ginkgo')
  contents.push('# @license     http://opensource.org/licenses/MIT  MIT License')
  contents.push('# @link        https://www.ioa.tw/')
  contents.push('#')
  contents.push('')
  contents.push('require "compass/import-once/activate"')
  contents.push('')
  contents.push('# 預設編碼')
  contents.push('Encoding.default_external = "utf-8"')
  contents.push('')
  contents.push('# 網域(domain)後面的目錄')
  contents.push('http_path = "/' + App.config.serve.compass.uri + '"')
  contents.push('')
  contents.push('# 字體目錄與網址下的字體目錄')
  contents.push('fonts_dir = "' + App.config.serve.dirs.icon + '"')
  contents.push('fonts_path = "' + relative + App.config.serve.dirs.icon + '"')
  contents.push('')
  contents.push('# css 目錄與 scss 目錄')
  contents.push('css_dir = "' + relative + App.config.serve.dirs.css + '"')
  contents.push('sass_dir = "' + relative + App.config.serve.dirs.scss + '"')
  contents.push('')
  contents.push('# 圖片目錄與網址下的圖片目錄')
  contents.push('images_dir = "' + App.config.serve.dirs.img + '"')
  contents.push('images_path = "' + relative + App.config.serve.dirs.img + '"')
  contents.push('')
  contents.push('# js 目錄與網址下的 js 目錄，目前沒發現在哪邊用到..')
  contents.push('javascripts_dir = "' + App.config.serve.dirs.js + '"')
  contents.push('javascripts_path = "' + relative + App.config.serve.dirs.js + '"')
  contents.push('')
  contents.push('# 其他要匯入的資源')
  contents.push('  # add_import_path = "./libs"')
  contents.push('additional_import_paths = [' + ['.' + Path.sep, relative + 'scss'].concat(App.config.serve.compass.imports).map(t => '"' + t + '"').join(', ') + ']')
  contents.push('')
  contents.push('# 選擇輸出的 css 類型，:expanded or :nested or :compact or :compressed')
  contents.push('  # nested     有縮排 沒壓縮，會有 @charset "UTF-8";')
  contents.push('  # expanded   沒縮排 沒壓縮，會有 @charset "UTF-8";')
  contents.push('  # compact    有換行 有壓縮(半壓縮)，會有 @charset "UTF-8";')
  contents.push('  # compressed 沒縮排 有壓縮(全壓縮)，沒有 @charset "UTF-8";')
  contents.push('output_style = :' + App.config.serve.compass.outputStyle)
  contents.push('')
  contents.push('# 在 css 中加入註解相對應於 scss 的第幾行，false、true')
  contents.push('  # false     不需加入註解')
  contents.push('  # true      需要加入註解')
  contents.push('line_comments = ' + App.config.serve.compass.lineComments)
  contents.push('')
  contents.push('# 是否使用相對位置，若是仰賴 http_path 則設為 false')
  contents.push('  # relative_assets = false')
  contents.push('relative_assets = ' + App.config.serve.compass.relative)

  try { FileSystem.writeFileSync(App.path('lib-scss') + 'config.rb', contents.join("\n") + "\n", 'utf8') }
  catch (e) { return false }
  return true
}

module.exports = (app, closure) => {
  App = app
  Progress = App.progress
  Path = App.path('$')

  const CmdExists = require('command-exists').sync

  process.stdout.write("\n" + ' ' + App.color.yellow('【檢查開發環境】') + "\n")

  const queue = new App.queue()

  queue.enqueue(next => Progress.block('檢查是否有 compass 指令', Progress.cmd('執行動作', 'check git compass'))
    .doing(progress => CmdExists('compass')
      ? progress.success('有')
      : progress.failure(null, '找不到 compass 指令，開發過程中會使用到 compass 指令！'))
    .go(next))

  queue.enqueue(next => Progress.block('檢查設定檔是否存在', Progress.cmd('執行動作', 'check ' + Path.relative(App.path('root'), App.path('cfg-main')) + ' is exists'))
    .doing(progress => FileSystem.existsSync(App.path('cfg-main'))
      ? progress.success('存在')
      : progress.failure(null, '尚未設定 ' + App.color.lGray('Serve') + ' 設定檔！'))
    .go(next))

  queue.enqueue(next => Progress.block('檢查 compass 目錄是否存在', Progress.cmd('執行動作', 'check ' + Path.relative(App.path('root'), App.path('lib-scss')) + ' is exists'))
    .doing(progress => FileSystem.existsSync(App.path('lib-scss'))
      ? progress.success('存在')
      : progress.failure(null, 'compass 目錄 ' + App.color.lGray(Path.relative(App.path('root'), App.path('lib-scss'))) + ' 不存在！'))
    .go(next))

  queue.enqueue(next => Progress.block('取得設定檔', Progress.cmd('執行動作', 'get ' + Path.relative(App.path('root'), App.path('cfg-main')) + ' file'))
    .total(12)
    .doing(progress => {
      App.config = require(App.path('cfg-main'))
      progress.counter

      try { App.config.serve.server.ssl = App.config.serve.server.ssl.key && App.config.serve.server.ssl.cert ? { key: FileSystem.readFileSync(App.path('cfg-ssl') + App.config.serve.server.ssl.key), cert: FileSystem.readFileSync(App.path('cfg-ssl') + App.config.serve.server.ssl.cert) } : null }
      catch (e) { App.config.serve.server.ssl = null }
      progress.counter

      App.path('entry', [App.config.entry, ''])
      progress.counter

      App.path('dest', [App.config.dest, ''])
      progress.counter

      App.path('entry-icon', [App.config.entry, App.config.serve.dirs.icon, ''])
      progress.counter

      App.path('entry-scss', [App.config.entry, App.config.serve.dirs.scss, ''])
      progress.counter

      App.path('entry-css', [App.config.entry, App.config.serve.dirs.css, ''])
      progress.counter

      App.path('entry-img', [App.config.entry, App.config.serve.dirs.img, ''])
      progress.counter

      App.path('entry-js', [App.config.entry, App.config.serve.dirs.js, ''])
      progress.counter

      App.config.serve.watch.formats = App.config.serve.watch.formats.map(ext => ext.toLowerCase())
      progress.counter

      App.config.serve.server.utf8Exts = App.config.serve.server.utf8Exts.map(ext => ext.toLowerCase())
      progress.counter

      const port = getArgv(['-P', '--port'])
      port === null || isNaN(port) || (App.config.serve.server.port = parseInt(port, 10))
      progress.success()
    })
    .go(next))

  queue.enqueue(next => Progress.block('檢查開發目錄是否存在', Progress.cmd('執行動作', 'check ' + Path.relative(App.path('root'), App.path('entry')) + ' is exists'))
    .doing(progress => FileSystem.existsSync(App.path('entry'))
      ? progress.success('存在')
      : progress.failure(null, '開發目錄不存在！'))
    .go(next))

  queue.enqueue(next => Progress.block('設定 Compass 設定檔', Progress.cmd('執行動作', 'write config.rb file'))
    .doing(progress => checkCompass()
      ? progress.success()
      : progress.failure(null, '寫入 Compass 設定檔失敗！'))
    .go(next))

  queue.enqueue(next => App.config.enablePHP ? next() : closure(App.config))

  queue.enqueue(next => Progress.block('檢查參數', Progress.cmd('執行動作', 'check argvs'))
    .total(3)
    .doing(progress => {
      App.config.argvs = {}
      progress.counter

      const env = getArgv(['-E', '--env'])
      App.config.argvs['--env'] = env === null || ['Development', 'Testing', 'Staging', 'Production'].indexOf(env) == -1 ? 'Development' : env
      progress.counter

      const baseURL = getArgv(['-U', '--base-url'])
      baseURL === null || (App.config.argvs['--base-url'] = baseURL)
      progress.success()
    })
    .go(next))

  queue.enqueue(next => Progress.block('檢查是否有 PHP 指令', Progress.cmd('執行動作', 'check php command'))
    .doing(progress => CmdExists('php')
      ? progress.success('有')
      : progress.failure(null, '找不到 PHP 指令，部署過程中會使用到 PHP 指令！'))
    .go(next))

  queue.enqueue(next => Progress.block('檢查 PHP 主要檔案是否存在', Progress.cmd('執行動作', 'check ' + Path.relative(App.path('root'), App.path('lib-php-main')) + ' is exists'))
    .doing(progress => FileSystem.existsSync(App.path('lib-php-main'))
      ? progress.success('存在')
      : progress.failure(null, 'PHP 主要檔案 ' + App.color.lGray(Path.relative(App.path('root'), App.path('lib-php-main'))) + ' 不存在！'))
    .go(next))

  return queue.enqueue(next => closure(App.config))
}
