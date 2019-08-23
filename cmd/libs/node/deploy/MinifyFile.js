/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display    = require('../Display')
const Xterm      = require('../Xterm')
const Rollback   = require('./Rollback')
const Argv       = require('./Argv')
const MinifyHTML = require('html-minifier').minify
const UglifyJS   = require('uglify-js')
const Path       = require('path')
const WriteFile  = require('fs').writeFileSync
const ReadFile   = require('fs').readFileSync
const Exists     = require('fs').existsSync
const FileStat   = require('fs').statSync

let oriSize = 0
let minSize = 0

const minifyCSS = closure => {
  const easterEgg = Exists(Path.deploy + 'EasterEgg-css.txt') ? ReadFile(Path.deploy + 'EasterEgg-css.txt', 'utf8') : null

  Display.lines('壓縮 ' + Xterm.color.gray('.css', true) + ' 檔案',
    ['執行動作', 'minify ' + Path.css.replace(Path.root, '') + '*.css'])

  const files = Argv.localFiles.filter(file => file.path.match(/\.css$/g))
  
  if (!files.length)
    return Display.line(true) && closure && closure()
  else
    Display.line(files.length)

  for (var i = 0; i < files.length && Display.line(); i++) {
    oriSize += FileStat(files[i].path).size
    let css = ReadFile(files[i].path, 'utf8')
    
    if (easterEgg !== null && easterEgg.length)
      css = css.replace(/(^@charset "UTF-8";)/g, '$1' + Display.LN + easterEgg)

    WriteFile(files[i].path, css.replace(/\}\n+/gm, '}'), 'utf8')
    minSize += FileStat(files[i].path).size
  }

  Argv.minifyRate = (minSize / oriSize * 100).toFixed(2) + '%(' + (0 - ((oriSize - minSize) / oriSize * 100)).toFixed(2) + '%)'

  return Display.line(true) && closure && closure()
}

const minifyHTML = closure => {
  const easterEgg = Exists(Path.deploy + 'EasterEgg-html.txt') ? ReadFile(Path.deploy + 'EasterEgg-html.txt', 'utf8') : null

  Display.lines('壓縮 ' + Xterm.color.gray('.html', true) + ' 檔案',
    ['執行動作', 'minify ' + Path.root.replace(Path.root, '') + '*.html'])

  const files = Argv.localFiles.filter(file => file.path.match(/\.html$/g))

  if (!files.length)
    return Display.line(true) && minifyCSS(closure)
  else
    Display.line(files.length)

  for (var i = 0; i < files.length && Display.line(); i++) {
    oriSize += FileStat(files[i].path).size
    let html = null
    
    try {
      html = MinifyHTML(ReadFile(files[i].path, 'utf8'), { collapseWhitespace: true, continueOnParseError: false })
    } catch(error) {
      return Display.line(false) || Rollback(['壓縮 ' + files[i].path.replace(Path.root, '') + ' 時發生錯誤！', '錯誤訊息：' + error.message])
    }

    if (html === null)
      return Display.line(false) || Rollback(['壓縮 ' + files[i].path.replace(Path.root, '') + ' 時發生不明原因錯誤！'])
    else
      WriteFile(files[i].path, (easterEgg !== null && easterEgg.length ? '<!-- ' + Display.LN + easterEgg + Display.LN + '-->' + Display.LN : '') + html, 'utf8')
   
    minSize += FileStat(files[i].path).size
  }

  return Display.line(true) && minifyCSS(closure)
}

const uglifyJS = closure => {
  const easterEgg = Exists(Path.deploy + 'EasterEgg-js.txt') ? ReadFile(Path.deploy + 'EasterEgg-js.txt', 'utf8') : null

  Display.lines('壓縮 ' + Xterm.color.gray('.js', true) + ' 檔案',
    ['執行動作', 'uglify ' + Path.js.replace(Path.root, '') + '*.js'])

  const files = Argv.localFiles.filter(file => file.path.match(/\.js$/g))

  if (!files.length)
    return Display.line(true) && minifyHTML(closure)
  else
    Display.line(files.length)

  for (var i = 0; i < files.length && Display.line(); i++) {
    oriSize += FileStat(files[i].path).size
    const result = UglifyJS.minify(ReadFile(files[i].path, 'utf8'), { mangle: { toplevel: true } })

    if (result.error)
      return Display.line(false) || Rollback(['壓縮 ' + files[i].path.replace(Path.root, '') + ' 時發生錯誤！', '錯誤訊息：' + result.error.message, '錯誤位置：第 ' + result.error.line + ' 行，第 ' + result.error.col + ' 個字'])
    else
      WriteFile(files[i].path, (easterEgg !== null && easterEgg.length ? easterEgg.replace(/^\n+/g, '') + Display.LN : '') + result.code, 'utf8')
    minSize += FileStat(files[i].path).size
  }

  return Display.line(true) && minifyHTML(closure)
}

module.exports = (title, closure) => Display.title(title) && uglifyJS(closure)
