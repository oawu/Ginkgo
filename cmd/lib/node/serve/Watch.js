/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const FileSystem    = require('fs')
const Exec          = require('child_process').exec

let App      = null
let Color    = null
let Path     = null
let Sep      = null
let Progress = null
let queue    = null
let readied  = false

const titles  = { add: '新增', change: '更新', unlink: '移除' }

const ScanDir = dir => FileSystem.existsSync(dir) ? FileSystem.readdirSync(dir).map(file => file !== '.' && file !== '..' ? FileSystem.statSync(dir + file).isDirectory() ? ScanDir(dir + file + Sep) : [dir + file] : null).filter(t => t !== null).reduce((a, b) => a.concat(b), []) : []

const removeFile = (filePath, done, fail) => FileSystem.exists(filePath, exists => exists ? FileSystem.unlink( filePath, error => error ? fail() : done()) : done())

const CompassCompile = closure => Exec('cd ' + App.path('lib-scss') + ' && compass compile', (error, stdout, stderr) => {
  let message = ''

  if (!error) return closure()

  let tokens = stdout.replace(/\x1b[[][^A-Za-z]*[A-Za-z]/g, '').split(/\s/).map(t => t.trim()).filter(t => t !== '')
  const action = tokens.shift(), file = tokens.shift()

  return closure(action === 'error' && file && Array.isArray(tokens = /\(Line\s*(\d+):\s*(.*)\)/g.exec(tokens.join(' ')))
    ? Color.lGray('第').dim() + ' ' + Color.yellow(tokens[1]) + ' ' + Color.lGray('行左右發生錯誤！').dim()
    : ('不明原因錯誤，以下為錯誤原因：' + "\n" + stdout))
})

const IconAction = function(type, info, first, next) { if (!(this instanceof IconAction)) return new IconAction(type, info, first, next)
  this.info     = info
  this.name     = info.dirName === 'icomoon' ? '' : this.info.dirName
  this.demoPath = App.path('entry-icon') + this.info.dirName + Sep + 'icon.html'
  this.scssPath = App.path('entry-scss') + 'icon' + (this.name ? '-' + this.name : '') + '.scss'
  this.cssPath  = App.path('entry-css') + 'icon' + (this.name ? '-' + this.name : '') + '.css'

  const done = _ => first ? Progress.do() : readied && Progress.success()

  !first && readied && Progress.doing(titles[type] + ' ICON', Progress.cmd('名稱', this.info.dirName)) && Progress.total(1)

  switch (type) {
    case 'add':
    case 'change':
      return FileSystem.readFile(info.filePath, 'utf8', (error, data) => error
        ? next(readied && Progress.failure())
        : FileSystem.writeFile(this.scssPath, this.parse(data), error => error
          ? next(readied && Progress.failure())
          : FileSystem.writeFile(this.demoPath, this.demo(data), error => error
            ? next(readied && Progress.failure())
            : next(done()))))

    case 'unlink':
      return removeFile(this.scssPath, 
        _ => removeFile(this.cssPath, 
          _ => removeFile(this.demoPath,
            _ => next(done()),
            error => next(readied && Progress.failure(null, error))),
          error => next(readied && Progress.failure(null, error))),
        error => next(readied && Progress.failure(null, error)))
  }
}
IconAction.prototype.parse = function(data) {
  const importStr = App.config.serve.iconByGinkgo ? '@import "GinkgoFont";' : '@import "compass/css3/font-face";'
  const basePath  = App.config.serve.iconByGinkgo ? '../icon/' : ''

  const className = this.name ? this.name + '-' : ''
  const fontFace  = 'icon' + (this.name ? '-' + this.name : '')
  const fontFiles = this.name ? this.name : 'icomoon'

  data = data.match(/\.icon-[a-zA-Z_\-0-9]*:before\s?\{\s*content:\s*"[\\A-Za-z0-9]*";(\s*color:\s*#[A-Za-z0-9]*;)?\s*}/g)
  data = Array.isArray(data) ? data.map(v => v.replace(/^\.icon-/g, '.icon-' + className).replace(/\n/g, ' ').replace(/\{\s*/g, '{ ').replace(/\s+/g, ' ')) : []
  data = data.sort((a, b) => a >= b ? a == b ? 0 : 1 : -1)
  
  const contents = []
  contents.push('//')
  contents.push('// @author      OA Wu <comdan66@gmail.com>')
  contents.push('// @copyright   Copyright (c) 2015 - ' + new Date().getFullYear() + ', Ginkgo')
  contents.push('// @license     http://opensource.org/licenses/MIT  MIT License')
  contents.push('// @link        https://www.ioa.tw/')
  contents.push('//')
  contents.push('')
  contents.push(importStr)

  if (!data.length) return contents.join("\n")
  
  contents.push('')
  contents.push('@include font-face("' + fontFace + '", font-files(')
  contents.push('  "' + basePath + fontFiles + '/fonts/icomoon.eot",')
  contents.push('  "' + basePath + fontFiles + '/fonts/icomoon.woff",')
  contents.push('  "' + basePath + fontFiles + '/fonts/icomoon.ttf",')
  contents.push('  "' + basePath + fontFiles + '/fonts/icomoon.svg"));')
  contents.push('')
  contents.push('*[class^="' + fontFace +'-"]:before, *[class*=" ' + fontFace +'-"]:before {')
  contents.push('  font-family: "' + fontFace + '";')
  contents.push('  speak: none;')
  contents.push('  font-style: normal;')
  contents.push('  font-weight: normal;')
  contents.push('  font-variant: normal;')
  contents.push('}')
  contents.push('')
  contents.push(...data)
  contents.push('')
  return contents.join("\n")
}
IconAction.prototype.demo = function(data) {
  const className = this.name ? this.name + '-' : ''
  const name = this.name === null ? 'icomoon' : this.name

  data = data.match(/\.icon-[a-zA-Z_\-0-9]*:before\s?\{\s*content:\s*"[\\A-Za-z0-9]*";(\s*color:\s*#[A-Za-z0-9]*;)?\s*}/g)
  data = Array.isArray(data) ? data.map(v => (v = v.replace(/\n/g, ' ').replace(/\{\s*/g, '{ ').replace(/\s+/g, ' ').match(/\.(icon-[a-zA-Z_\-0-9]*):before\s?\{\s*content:\s*"\\([A-Za-z0-9]*)";.*/)) && [v[1], v[1].replace(/^icon-/g, 'icon-' + className), v[2]]).filter(t => t !== null) : []
  
  const contents = []
  contents.push('<!DOCTYPE html>')
  contents.push('<html lang="zh-Hant">')
  contents.push('<head>')
  contents.push('<meta http-equiv="Content-Language" content="zh-tw">')
  contents.push('<meta http-equiv="Content-type" content="text/html; charset=utf-8">')
  contents.push('<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">')
  contents.push('<title>Icon Font - Ginkgo！</title>')
  contents.push('<link rel="stylesheet" type="text/css" href="style.css">')
  contents.push('<style type="text/css">*, *:after, *:before { vertical-align: top; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; -moz-osx-font-smoothing: subpixel-antialiased; -webkit-font-smoothing: subpixel-antialiased; -moz-font-smoothing: subpixel-antialiased; -ms-font-smoothing: subpixel-antialiased; -o-font-smoothing: subpixel-antialiased; }h1 span a { color: #1890ff; -moz-transition: color 0.3s; -o-transition: color 0.3s; -webkit-transition: color 0.3s; transition: color 0.3s; }h1 span a:hover { color: #0076e4; }body, h1, h1:after, main, div, div > * { position: relative; display: inline-block; }div > :after, div:before { position: absolute; display: inline-block; }body, h1, main, div > :after { width: 100%; }body, h1 { margin: 0; }main, div > :after { background-color: white; }div, div > * { -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }h1, div > * { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }div > :after, div:before { left: 0; }div > .ok:after, div > .no:after, div:before { top: 0; }body, div > :after { text-align: center; }body { padding: 0; color: #5a5a5a; font-size: medium; font-family: "微軟正黑體", "Open sans", "Helvetica Neue", HelveticaNeue, Helvetica, Arial, sans-serif; background-color: #ececec; }h1 { height: 72px; line-height: 72px; padding: 0 16px; text-align: left; font-size: 20px; color: #555555; }h1:before { content: "名稱："; color: #999999; }h1:after { margin-top: 2px; margin-left: 8px; font-size: 13px; font-weight: normal; color: #969696; }h1[data-count]:not([data-count="0"]):after { content: "(" attr(data-count) "個)"; }h1 span { position: absolute; right: 8px; bottom: 4px; }main { min-height: calc(100vh - 72px); margin: 0 auto; padding: 16px; border-top: 1px solid #dedede; *zoom: 1; background-color: #f7f8f9; }main:after { display: table; content: ""; line-height: 0; clear: both; }div { float: left; width: 300px; height: 64px; margin-bottom: 12px; margin-right: 16px; padding: 8px 0; padding-left: 64px; background-color: white; border: 1px solid #e6e6e6; border-bottom: 1px solid #dedede; }div > * { width: calc(100% - 16px); margin: 0 8px; padding: 0 8px; text-align: left; cursor: pointer; -moz-transition: background-color 0.3s; -o-transition: background-color 0.3s; -webkit-transition: background-color 0.3s; transition: background-color 0.3s; }div > *:hover { background-color: #f0f0f0; }div > *:active { background-color: #e6e6e6; }div > *:after { content: ""; top: -100%; height: 100%; color: white; -moz-transition: opacity 0.5s; -o-transition: opacity 0.5s; -webkit-transition: opacity 0.5s; transition: opacity 0.5s; filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=0); opacity: 0; }div > *.ok:after, div > *.no:after { filter: progid:DXImageTransform.Microsoft.Alpha(enabled=false); opacity: 1; }div > *.ok:after { content: "已複製"; background-color: #1dab89; }div > *.no:after { content: "失敗"; background-color: #ea4335; }div:before { content: "?"; width: 64px; height: 64px; line-height: 64px; font-size: 30px; border-right: 1px solid #e6e6e6; }label { font-size: 18px; height: 28px; line-height: 28px; }label:after { font-size: 14px; }span { height: 20px; line-height: 20px; font-size: 13px; color: #969696; text-align: right; }span:before { font-size: 10px; color: #b4b4b4; content: "編碼："; }span.ok:after { background-color: #34b0ab; }</style>')
  contents.push('</head>')
  contents.push('<body>')
  contents.push('<h1 data-count="' + data.length + '">')
  contents.push('icomoon')
  contents.push('<span>Generated by <a href="https://github.com/comdan66/Ginkgo">Ginkgo</a></span>')
  contents.push('</h1>')
  contents.push('<main>')
  contents.push(data.map(val => '<div class="' + val[0] + '"><label data-clipboard-text="' + val[1] + '">' + val[1] + '</label><span data-clipboard-text="' + val[2] + '">' + val[2] + '</span></div>').join(''))
  contents.push('</main>')
  contents.push('</body>')
  contents.push('</html>')

  return contents.join('')
}
const ScssAction = function(type, info, first, next) {
  if (!(this instanceof ScssAction)) return new ScssAction(type, info, first, next)
  
  const uri = Path.relative(App.path('root'), info.filePath)
  
  !first && readied && Progress.doing(titles[type] + ' scss', Progress.cmd('檔案', uri)) && Progress.total(1)

  switch (type) {
    case 'add':
    case 'change':
      return first
        ? next(Progress.do())
        : CompassCompile(error => next(readied
          ? error
            ? Progress.failure() && process.stdout.write("\r" + ' '.repeat(5) + Color.purple('↳').dim() + ' ' + error + "\n")
            : Progress.success()
          : null))

    case 'unlink':
      return removeFile(App.path('entry-css') + info.fileName.replace(/\.scss$/, '.css'),
        _ => removeFile(info.fileName,
          _ => next(readied && Progress.success()),
          error => next(readied && Progress.failure(null, error))),
        error => next(readied && Progress.failure(null, error)))
  }
}

const watchIcon = closure => {
  Progress.doing('啟動 ICON 功能', Progress.cmd('執行動作', 'watch ' + Path.relative(App.path('root'), App.path('entry-icon')) + Sep + 'style.css'))
  try { Progress.total(FileSystem.readdirSync(App.path('entry-icon')).filter(file => FileSystem.statSync(App.path('entry-icon') + file).isDirectory() && FileSystem.existsSync(App.path('entry-icon') + file + Sep + 'style.css')).length) }
  catch (error) { Progress.total(1) }

  const validate = filePath => {
    const tokens = Path.relative(App.path('entry-icon'), filePath).split(Sep).map(t => t.trim()).filter(v => v.length)
    if (tokens.length < 2) return false
    const dirName = tokens.shift()
    const fileName = tokens.pop()
    return fileName == 'style.css' && { dirName, fileName, filePath }
  }

  const next = (type, filePath) => {
    filePath = validate(filePath)
    filePath && queue.enqueue(next => IconAction(type, filePath, first, next))
  }

  let first = true
  require('chokidar')
    .watch(App.path('entry-icon'))
    .on('add',    next.bind(null, 'add'))
    .on('change', next.bind(null, 'change'))
    .on('unlink', next.bind(null, 'unlink'))
    .on('error', error => Progress.failure(null, error))
    .on('ready', _ => queue.enqueue(next => next(first = false, Progress.success(), closure())))
}
const watchScss = closure => {
  Progress.doing('啟動 SCSS 功能', Progress.cmd('執行動作', 'watch ' + Path.relative(App.path('root'), App.path('entry-scss')) + Sep + '*.css'))
  try { Progress.total(ScanDir(App.path('entry-scss')).map(file => Path.extname(file) == '.scss').length) }
  catch (error) { Progress.total(1) }

  let first = true

  const validate = filePath => {
    const tokens = Path.relative(App.path('entry-scss'), filePath).split(Sep).map(t => t.trim()).filter(v => v.length)
    if (!tokens.length) return false
    const fileName = tokens.pop()
    return Path.extname(fileName) == '.scss' && { fileName, filePath }
  }

  const next = (type, filePath) => {
    filePath = validate(filePath)
    filePath && queue.enqueue(next => ScssAction(type, filePath, first, next))
  }

  CompassCompile(error => error
    ? Progress.failure(null, error)
    : require('chokidar')
      .watch(App.path('entry-scss') + '**' + Sep + '*.scss')
      .on('add',    next.bind(null, 'add'))
      .on('change', next.bind(null, 'change'))
      .on('unlink', next.bind(null, 'unlink'))
      .on('error', error => Progress.failure(null, error))
      .on('ready',  _ => queue.enqueue(next => next(first = false, Progress.success(), closure()))))
}
const watchFile = function(closure) {
  Progress.doing('監控 FILE 檔案', Progress.cmd('執行動作', 'watch ' + ' ' + App.config.serve.watch.formats.join('、')))
  try { Progress.total(ScanDir(App.path('entry')).map(file => App.config.serve.watch.formats.indexOf(Path.extname(file).toLowerCase()) != -1).length) }
  catch (error) { Progress.total(1) }

  let first = true

  const validate = filePath => {
    const tokens = Path.relative(App.path('entry'), filePath).split(Sep).map(t => t.trim()).filter(v => v.length)
    if (!tokens.length) return false
    const fileName = tokens.pop()
    const dir = tokens.shift()
    return App.config.serve.watch.formats.indexOf(Path.extname(fileName)) != -1 && (!App.config.serve.watch.ignoreDirs.length || !dir || App.config.serve.watch.ignoreDirs.indexOf(dir) == -1) && filePath
  }

  const next = (type, filePath) => {
    filePath = validate(filePath)
    !first && filePath && queue.enqueue(next => next(
      Progress.doing(titles[type] + '檔案', Progress.cmd('檔案路徑', Path.relative(App.path('root'), filePath))),
      Progress.total(1),
      App.socketIO && App.socketIO.sockets.emit('reload', true),
      Progress.success()
    ))
  }

  Promise.all(App.config.serve.watch.formats.map(format => new Promise((resolve, reject) => {
    require('chokidar')
      .watch(App.path('entry') + '**' + Sep + '*' + format)
      .on('add', next.bind(null, 'add'))
      .on('change', next.bind(null, 'change'))
      .on('unlink', next.bind(null, 'unlink'))
      .on('error', reject)
      .on('ready', resolve)
  })))
  .catch(error => Progress.failure(null, error))
  .then(_ => first = false, Progress.success(), closure())
}

module.exports = (app, closure) => {
  App = app
  Color = App.color
  Progress = App.progress
  queue = new App.queue()
  Path = App.path('$')
  Sep = Path.sep

  process.stdout.write("\n" + ' ' + Color.yellow('【啟動專案】') + "\n")

  App.onReady(status => readied = status)

  new App.queue(
    next => watchIcon(next),
    next => watchScss(next),
    next => watchFile(next),
    next => closure())
}
