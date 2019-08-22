/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

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

      ready && Display.line(
        Xterm.color.gray(event, true) + ' ' + filepath.replace(Path.root, '').split(Path.sep).pop(),
        Xterm.color.gray('變更檔案', true).dim() + Display.markSemicolon() + Xterm.color.gray(filepath.replace(Path.root, ''), true).dim().italic(),
        clinetReload ? Xterm.color.gray('執行動作', true).dim() + Display.markSemicolon() + Xterm.color.gray('reload dev browser', true).dim().italic() : null)

      clinetReload && clinetReload()

      ready && Display.line(true)

      clearTimeout(timers[format])
      timers[format] = null
      delete timers[format]
    }, later)
}

const wait = closure => setTimeout(() => !isCallClosure ? Object.keys(timers).length ? wait(closure) : (isCallClosure = Display.line(true)) && closure && closure() : null, readyLater)

module.exports = (title, formats, closure, clinetReload) => {

  Display.title(title)
  Display.line('監控目錄',
    formats.map(format => Xterm.color.gray('執行動作', true).dim() + Display.markSemicolon() + Xterm.color.gray('watch *.' + format, true).dim().italic()))

  formats.forEach(
    format => require('chokidar')
                .watch(Path.root + '**' + Path.sep + '*.' + format)
                .on('change', reload.bind(null, '修改', format, clinetReload))
                .on('add',    reload.bind(null, '新增', format, clinetReload))
                .on('unlink', reload.bind(null, '移除', format, clinetReload))
                .on('error',  error => Notifier('[' + format + '] 錯誤！', '監控發生錯誤', '請至終端機確認錯誤原因！') && Display.line(false, error.message))
                .on('ready',  () => wait(closure)))
  
  Bus.on('ready', status => ready = status)
}
