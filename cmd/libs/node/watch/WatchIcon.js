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
const FileSystem = require('fs')
const ReadFile   = require('fs').readFileSync
const Exists     = require('fs').existsSync

const html       = Exists(Path.iconHtml) ? ReadFile(Path.iconHtml, 'utf8') : ''

let timers = {}
let ready  = false

const later = 250
const readyLater = 500

const parseData = (name, data) => {
  const className = name ? name + '-' : ''
  const fontFace = 'icon' + (name ? '-' + name : '')
  const fontFiles = name ? name : 'icomoon'

  data = data.match(/\.icon-[a-zA-Z_\-0-9]*:before\s?\{\s*content:\s*"[\\A-Za-z0-9]*";(\s*color:\s*#[A-Za-z0-9]*;)?\s*}/g)
  data = Array.isArray(data) ? data.map(v => v.replace(/^\.icon-/g, '.icon-' + className).replace(/\n/g, ' ').replace(/\{\s*/g, '{ ').replace(/\s+/g, ' ')) : []
  data = '//\n// @author      OA Wu <comdan66@gmail.com>\n// @copyright   Copyright (c) 2015 - ' + (new Date().getFullYear()) + ', Ginkgo\n// @license     http://opensource.org/licenses/MIT  MIT License\n// @link        https://www.ioa.tw/\n//\n\n' + (data.length ? '@import "compass/css3/font-face";\n\n@include font-face("' + fontFace + '", font-files(\n  "' + fontFiles + '/fonts/icomoon.eot",\n  "' + fontFiles + '/fonts/icomoon.woff",\n  "' + fontFiles + '/fonts/icomoon.ttf",\n  "' + fontFiles + '/fonts/icomoon.svg"));\n\n*[class^="' + fontFace +'-"]:before, *[class*=" ' + fontFace +'-"]:before {\n  font-family: "' + fontFace + '";\n\n  speak: none;\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n}\n\n' + data.join(Display.LN) : '@import "compass/css3/font-face";') + Display.LN
  return data
}

const htmlData = (name, data) => {
  if (!html.length)
    return '發生錯誤！'
  
  const $ = require('cheerio').load(html)
  const MinifyHTML = require('html-minifier').minify

  const className = name ? name + '-' : ''
  name = name === null ? 'icomoon' : name
  data = data.match(/\.icon-[a-zA-Z_\-0-9]*:before\s?\{\s*content:\s*"[\\A-Za-z0-9]*";(\s*color:\s*#[A-Za-z0-9]*;)?\s*}/g)
  data = Array.isArray(data) ? data.map(v => (v = v.replace(/\n/g, ' ').replace(/\{\s*/g, '{ ').replace(/\s+/g, ' ').match(/\.(icon-[a-zA-Z_\-0-9]*):before\s?\{\s*content:\s*"\\([A-Za-z0-9]*)";.*/)) && [v[1], v[1].replace(/^icon-/g, 'icon-' + className), v[2]]).filter(t => t !== null) : []
  
  $('body').append(
    $('<h1 />').attr('data-count', data.length).text(name).append(
      $('<span />').text('Generated by ').append(
        $('<a />').attr('href', 'https://github.com/comdan66/Ginkgo').text('Ginkgo')))).append(
    $('<main />').append(
      data.map(t => $('<div />').addClass(t[0]).append(
        $('<label />').attr('data-clipboard-text', t[1]).text(t[1])).append(
        $('<span />').attr('data-clipboard-text', t[2]).text(t[2])))))
    
  try {
    return MinifyHTML($.html(), { collapseWhitespace: true, continueOnParseError: false })
  } catch(error) {
    return '發生錯誤！'
  }
}

const move = (event1, event2, forder, filepath) => {
  const newName  = 'icon' + (forder != 'icomoon' ? '-' + forder : '') + '.scss'
  const newPath  = Path.scss + newName
  const htmlPath = Path.icon + forder + Path.sep + 'icon.html'
  
  ready && Display.line(
    Xterm.color.gray(event1, true) + ' icon',
    Xterm.color.gray('變更檔案', true).dim() + Display.markSemicolon() + Xterm.color.gray(filepath.replace(Path.root, ''), true).dim().italic(),
    Xterm.color.gray('執行動作', true).dim() + Display.markSemicolon() + Xterm.color.gray(event2 + ' ' + newName, true).dim().italic())
  
  if (event1 == '移除' && event2 == 'remove')
    FileSystem.exists(newPath,
      exists => exists
        ? FileSystem.unlink(newPath,
          error => error
            ? ready && Display.line(false, error.message)
            : FileSystem.exists(htmlPath,
              exists => exists
                ? FileSystem.unlink(htmlPath,
                  error => error
                    ? ready && Display.line(false, error.message)
                    : ready && Display.line(true))
                : ready && Display.line(true)))
        : FileSystem.exists(htmlPath,
          exists => exists
            ? FileSystem.unlink(htmlPath,
              error => error
                ? ready && Display.line(false, error.message)
                : ready && Display.line(true))
            : ready && Display.line(true)))
  else
    FileSystem.readFile(filepath, 'utf8',
      (error, data) => error
        ? ready && Display.line(false, error)
        : FileSystem.writeFile(newPath, parseData(forder == 'icomoon' ? null : forder, data),
          error => error
            ? ready && Display.line(false, error.message)
            : FileSystem.writeFile(htmlPath, htmlData(forder == 'icomoon' ? null : forder, data),
              error => ready && (error ? Display.line(false, error.message) : Display.line(true)))))

  clearTimeout(timers[forder])
  timers[forder] = null
  delete timers[forder]
}

const modify = (event1, event2, filepath) => {
  let token = filepath.replace(Path.icon, '').split(Path.sep).map(t => t.trim()).filter(v => v.length)

  if (token.length < 2)
    return

  let forder   = token.shift()
  let filename = token.pop()

  if (filename != 'style.css')
    return

  if(!timers[forder])
    timers[forder] = setTimeout(move.bind(null, event1, event2, forder, filepath), later)
}

const wait = closure => setTimeout(() => Object.keys(timers).length ? wait(closure) : Display.line(true) && closure && closure(), readyLater)

module.exports = (title, closure) => true &&
  Display.title(title) &&

  Display.lines('監控目錄',
    ['執行動作', 'watch ' + Path.icon.replace(Path.root, '')]) &&

  require('chokidar')
    .watch(Path.icon)
    .on('change', modify.bind(null, '修改', 'rebuild'))
    .on('add',    modify.bind(null, '新增', 'create'))
    .on('unlink', modify.bind(null, '移除', 'remove'))
    .on('error',  error => Notifier('[icon 目錄] 錯誤！', '監控目錄發生錯誤', '請至終端機確認錯誤原因！') && Display.line(false, error))
    .on('ready',  () => wait(closure)) &&

  Bus.on('ready', status => ready = status)
