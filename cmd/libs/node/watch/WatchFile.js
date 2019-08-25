/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const windowPath = require('../Ginkgo').windowPath
const Notifier   = require('../Ginkgo').notifier
const Bus        = require('../Ginkgo').bus
const Display    = require('../Display')
const Xterm      = require('../Xterm')
const Path       = require('path')

let ignoreDirs = ['cmd', 'font']
let timers = {}
let ready = false
let isCallClosure = false

const later = 250
const readyLater = 500

const reload = (event, format, clinetReload, filepath) => {
  let token = filepath.replace(Path.root, '').split(Path.sep).map(t => t.trim()).filter(v => v.length)

  if (ignoreDirs.indexOf(token.shift()) !== -1)
    return

  if (Path.extname(filepath) != '.' + format)
    return

  if(!timers[format])
    timers[format] = setTimeout(() => {

      ready && Display.lines(
        Xterm.color.gray(event, true) + ' ' + filepath.replace(Path.root, '').split(Path.sep).pop(),
        ['變更檔案', filepath.replace(Path.root, '')],
        clinetReload ? ['執行動作', 'reload dev browser'] : null)

      clinetReload && clinetReload()

      ready && Display.line(true)

      clearTimeout(timers[format])
      timers[format] = null
      delete timers[format]
    }, later)
}

const wait = closure => setTimeout(() => !isCallClosure ? Object.keys(timers).length ? wait(closure) : (isCallClosure = Display.line(true)) && closure && closure() : null, readyLater)

module.exports = (title, formats, closure, clinetReload) => true &&
  Display.title(title) &&

  Display.lines('監控目錄',
    ...formats.map(format => ['執行動作', 'watch *.' + format])) &&

  formats.map(
    format => require('chokidar')
                .watch(windowPath(Path.root + '**' + Path.sep + '*.' + format))
                .on('change', reload.bind(null, '修改', format, clinetReload))
                .on('add',    reload.bind(null, '新增', format, clinetReload))
                .on('unlink', reload.bind(null, '移除', format, clinetReload))
                .on('error',  error => Notifier('[' + format + '] 錯誤！', '監控發生錯誤', '請至終端機確認錯誤原因！') && Display.line(false, error.message))
                .on('ready',  () => wait(closure))) &&
  
  Bus.on('ready', status => ready = status)
