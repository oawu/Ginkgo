/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

let App      = null
let Color    = null
let Path     = null
let Sep      = null
let Progress = null

const getArgv = keys => {
  const argvs = process.argv.slice(2)
  for(let i = 0; i < argvs.length; i++)
    if (keys.indexOf(argvs[i]) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        return argvs[i + 1]
  return null
}

module.exports = (app, closure) => {
  App = app,
    Color = App.color,
    Progress = App.progress,
    Path = App.path('$'),
      Sep = Path.sep

  const CmdExists = require('command-exists').sync
  const FileSystem = require('fs')

  process.stdout.write("\n" + ' ' + Color.yellow('【檢查編譯環境】') + "\n")

  const queue = new App.queue()

  queue.enqueue(next => Progress.block('檢查設定檔是否存在', Progress.cmd('執行動作', 'check ' + Path.relative(App.path('root'), App.path('cfg-main')) + ' is exists'))
    .doing(progress => FileSystem.existsSync(App.path('cfg-main'))
      ? progress.success('存在')
      : progress.failure(null, '尚未設定 ' + Color.lGray('Serve') + ' 設定檔！'))
    .go(next))

  queue.enqueue(next => Progress.block('取得設定檔', Progress.cmd('執行動作', 'get ' + Path.relative(App.path('root'), App.path('cfg-main')) + ' file'))
    .total(5)
    .doing(progress => {
      App.config = require(App.path('cfg-main'))
      progress.counter
      
      App.path('entry', [App.config.entry, ''])
      progress.counter

      App.path('dest', [App.config.dest, ''])
      progress.counter      

      App.config.build.ignoreDirs = App.config.build.ignoreDirs
        .reduce((a, b) => a.indexOf(b) == -1 ? (a.push(b), a) : a, [])
        .map(dir => new RegExp('^' + Path.normalize(App.path('entry') + dir + Sep), 'gm'))
      progress.counter

      App.config.build.exts = App.config.build.exts.map(ext => ext.toLowerCase())
      progress.success()
    })
    .go(next))

  queue.enqueue(next => Progress.block('檢查開發目錄是否存在', Progress.cmd('執行動作', 'check ' + Path.relative(App.path('root'), App.path('entry')) + ' is exists'))
    .doing(progress => FileSystem.existsSync(App.path('entry'))
      ? progress.success('存在')
      : progress.failure(null, '開發目錄不存在！'))
    .go(next))

  queue.enqueue(next => App.config.enablePHP ? next() : closure(App.config))

  queue.enqueue(next => Progress.block('檢查參數', Progress.cmd('執行動作', 'check argvs'))
    .total(3)
    .doing(progress => {
      App.config.build.argvs = {}
      progress.counter

      const env = getArgv(['-E', '--env'])
      App.config.build.argvs['--env'] = env === null || ['Development', 'Testing', 'Staging', 'Production'].indexOf(env) == -1 ? 'Development' : env
      progress.counter

      const baseURL = getArgv(['-U', '--base-url'])
      baseURL === null || (App.config.build.argvs['--base-url'] = baseURL)
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
      : progress.failure(null, 'PHP 主要檔案 ' + Color.lGray(Path.relative(App.path('root'), App.path('lib-php-main'))) + ' 不存在！'))
    .go(next))

  return queue.enqueue(next => closure(App.config))
}
