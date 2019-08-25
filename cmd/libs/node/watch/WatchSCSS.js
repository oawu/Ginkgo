/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const windowPath = require('../Ginkgo').windowPath
const Notifier   = require('../Ginkgo').notifier
const print      = require('../Ginkgo').print
const Bus        = require('../Ginkgo').bus
const Display    = require('../Display')
const Xterm      = require('../Xterm')
const Path       = require('path')
const FileSystem = require('fs')

let timer = null
let ready = false

const later      = 250
const readyLater = 500

const compile = (event1, event2, filepath) => {
  let filename = filepath.replace(Path.scss, '').replace(/\.scss$/, '.css')

  ready && Display.lines(
    Xterm.color.gray(event1, true) + ' scss',
    ['變更檔案', filepath.replace(Path.root, '')],
    ['執行動作', event2 + ' ' + filename])
  
  if (event1 == '移除' && event2 == 'remove')
    FileSystem.exists(Path.css + filename, exists => exists ? FileSystem.unlink(Path.css + filename, error => ready && (error ? Display.line(false, error.message) : Display.line(true))) : ready && Display.line(true))
  else
    require('child_process').exec('compass compile', (error, stdout, stderr) => {
      stdout = stdout.replace(/\x1b[[][^A-Za-z]*[A-Za-z]/g, '')
                     .split(/\s/).map(t => t.trim())
                     .filter(t => t !== '')

      if (!stdout.length)
        return

      const action = stdout.shift()
      const file   = stdout.shift()

      if (action == 'delete')
        return

      if (action == 'write')
        return ready && Display.line(true)

      if (action == 'error') {
        stdout = /\(Line\s*(\d+):\s*(.*)\)/g.exec(stdout.join(' '))

        if (!Array.isArray(stdout))
          return ready && Notifier('[SCSS 目錄] 錯誤！', '編譯 SCSS 檔案發生錯誤', '請至終端機確認錯誤原因！') && Display.line(false)

        ready && Notifier('[SCSS 目錄] 錯誤！', '編譯 SCSS 檔案發生錯誤', '請至終端機確認錯誤原因！') && Display.line(false)
        ready && print(' '.repeat(5) + Display.markHash() + ' ' + Xterm.color.gray('在第', true).dim() + ' ' + Xterm.color.yellow(stdout[1]) + ' ' + Xterm.color.gray('行左右發生錯誤！', true).dim() + Display.LN)
        return false
      }

      return ready && Notifier('[SCSS 目錄] 錯誤！', '編譯 SCSS 檔案發生錯誤', '請至終端機確認錯誤原因！') && Display.line(false)
    })

  clearTimeout(timer)
  timer = null
}

const modify = (event1, event2, filepath) => {
  let token = filepath.replace(Path.scss, '').split(Path.sep).map(t => t.trim()).filter(v => v.length)

  let filename = token.pop()

  if (Path.extname(filename) != '.scss')
    return

  if(!timer)
    timer = setTimeout(compile.bind(null, event1, event2, filepath), later)
}

const wait = closure => setTimeout(() => timer === null ? Display.line(true) && closure && closure() : wait(closure), readyLater)

module.exports = (title, closure) => true &&
  Display.title(title) &&

  Display.lines('監控目錄',
    ['執行動作', 'watch ' + Path.scss.replace(Path.root, '') + '*.scss']) &&

  require('chokidar')
    .watch(windowPath(Path.scss + '**' + Path.sep + '*.scss'))
    .on('change', modify.bind(null, '修改', 'compile'))
    .on('add',    modify.bind(null, '新增', 'compile'))
    .on('unlink', modify.bind(null, '移除', 'remove'))
    .on('error',  error => Notifier('[SCSS 目錄] 錯誤！', '監控目錄發生錯誤', '請至終端機確認錯誤原因！') && Display.line(false, error.message))
    .on('ready',  () => wait(closure)) &&
  
  Bus.on('ready', status => ready = status)
