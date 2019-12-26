/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path        = require('path')
const Exec        = require('child_process').exec
const Notifier    = require('../Notifier')
const Display     = require('../Display')
const Xterm       = require('../Xterm')
const Print       = require('../Print')
const Bus         = require('../Bus')
const ParseData   = require('./ParseData')
const DemoData    = require('./DemoData')
const Actions     = require('./Actions')
const Config      = require(Path.config)
const FileSystem  = require('fs')
  const Exists    = FileSystem.exists
  const Unlink    = FileSystem.unlink
  const FileRead  = FileSystem.readFile
  const FileWrite = FileSystem.writeFile

let readied = false
let compassInited = false

const removeFile = (filepath, done, fail) => Exists(filepath, exists => exists ? Unlink(filepath, error => error ? fail() : done()) : done())
const fail = message => readied && !Display.line(false, message) || false
const done = closure => (readied && Display.line(true), typeof closure == 'function' && closure())

const CompassCompile = closure => Exec('cd ' + Path.compass + ' && compass compile', (error, stdout, stderr) => {
  let message = ''

  if (!error) return typeof closure == 'function' && closure(message)

  let tokens = stdout.replace(/\x1b[[][^A-Za-z]*[A-Za-z]/g, '').split(/\s/).map(t => t.trim()).filter(t => t !== '')
  const action = tokens.shift()
  const file   = tokens.shift()

  message = action === 'error' && file && Array.isArray(tokens = /\(Line\s*(\d+):\s*(.*)\)/g.exec(tokens.join(' ')))
    ? Xterm.color.gray('在第', true).dim() + ' ' + Xterm.color.yellow(tokens[1]) + ' ' + Xterm.color.gray('行左右發生錯誤！', true).dim()
    : '不明原因錯誤！'

  return typeof closure == 'function' && closure(message)
})

const IconAction = function(type, filepath) {
  if (!(this instanceof IconAction))
    return new IconAction(type, filepath)
  
  let _type = null, _filepath = null, _forder = null

  this.run = closure => {
    const name = this.forder() === 'icomoon' ? '' : this.forder()
    const scss = 'icon' + (name ? '-' + name : '') + '.scss'
    const demo = Path.icon + this.forder() + Path.sep + 'icon.html'

    switch (this.type()) {
      case Actions.rebuild:
        readied && Display.lines('更新 ICON', '名稱', this.forder())
        return FileRead(this.filepath(), 'utf8', (error, data) => error ? fail(error.message) : FileWrite(Path.scss + scss, ParseData(name, data), error => error ? fail(error.message) : FileWrite(demo, DemoData(name, data), error => error ? fail(error.message) : done(closure))))

      case Actions.create:
        readied && Display.lines('新增 ICON', '名稱', this.forder())
        return FileRead(this.filepath(), 'utf8', (error, data) => error ? fail(error.message) : FileWrite(Path.scss + scss, ParseData(name, data), error => error ? fail(error.message) : FileWrite(demo, DemoData(name, data), error => error ? fail(error.message) : done(closure))))

      case Actions.remove:
        readied && Display.lines('移除 ICON', '名稱', this.forder())
        return removeFile(Path.scss + scss, _ => removeFile(Path.css + 'icon' + (name ? '-' + name : '') + '.css', _ => removeFile(demo, _ => done(closure), error => fail(error.message)), error => fail(error.message)), error => fail(error.message))

      default:
        return typeof closure == 'function' && closure()
    }
  }

  this.type     = type     => Actions.types.indexOf(type) != -1 ? (_type = type, this) : _type
  this.filepath = filepath => filepath ? (_filepath = filepath, this) : _filepath
  this.forder   = forder   => forder   ? (_forder = forder, this) : _forder

  let tokens = filepath.replace(Path.icon, '').split(Path.sep).map(t => t.trim()).filter(v => v.length)
  let tmp = tokens.shift()
  tmp && tokens.pop() === 'style.css' && Actions.push(this.type(type).filepath(filepath).forder(tmp))
}

const ScssAction = function(type, filepath) {
  if (!(this instanceof ScssAction))
    return new ScssAction(type, filepath)

  let _type = null, _filepath = null, _filename = null

  this.run = closure => {
    const uri  = this.filepath().replace(Path.root, '')
    switch (this.type()) {
      case Actions.rebuild:
      readied = true
        readied && Display.lines('更新 scss', '檔案', uri)
        return CompassCompile(error => error ? (fail() && Print(' '.repeat(5) + Display.markHash() + ' ' + error + Display.LN) && Notifier('[SCSS 目錄] 錯誤！', '編譯 SCSS 檔案發生錯誤', '請至終端機確認錯誤原因！'), typeof closure == 'function' && closure()) : done(closure))

      case Actions.create:
        readied && Display.lines('新增 scss', '檔案', uri)
        return CompassCompile(error => error ? (fail() && Print(' '.repeat(5) + Display.markHash() + ' ' + error + Display.LN) && Notifier('[SCSS 目錄] 錯誤！', '編譯 SCSS 檔案發生錯誤', '請至終端機確認錯誤原因！'), typeof closure == 'function' && closure()) : done(closure))

      case Actions.remove:
        readied && Display.lines('移除 scss', '檔案', uri)
        return removeFile(Path.css + this.filepath().replace(Path.scss, '').replace(/\.scss$/, '.css'), _ => removeFile(this.filepath(), _ => done(closure), error => fail(error.message)), error => fail(error.message))
      
      default:
        return typeof closure == 'function' && closure()
    }
  }

  this.type     = type     => Actions.types.indexOf(type) != -1 ? (_type = type, this) : _type
  this.filepath = filepath => filepath ? (_filepath = filepath, this) : _filepath
  this.filename = filename => filename ? (_filename = filename, this) : _filename

  let tokens = filepath.replace(Path.scss, '').split(Path.sep).map(t => t.trim()).filter(v => v.length)
  let tmp = tokens.pop()
  Path.extname(tmp) === '.scss' && Actions.push(this.type(type).filepath(filepath).filename(tmp))
}

const FileAction = function(type, filepath) {
  if (!(this instanceof FileAction))
    return new FileAction(type, filepath)

  let _type = null, _filepath = null
  
  this.run = closure => {
    switch (this.type()) {
      case Actions.rebuild:
        readied && Display.linesM('更新檔案', ['檔案路徑', this.filepath().replace(Path.entry, '')], ['執行動作', 'load page'])
        return Bus.has('reload')
          ? Bus.emit('reload', _ => done(closure))
          : done(closure)

      case Actions.create:
        readied && Display.linesM('新增檔案', ['檔案路徑', this.filepath().replace(Path.entry, '')], ['執行動作', 'load page'])
        return Bus.has('reload')
          ? Bus.emit('reload', _ => done(closure))
          : done(closure)

      case Actions.remove:
        readied && Display.linesM('移除檔案', ['檔案路徑', this.filepath().replace(Path.entry, '')], ['執行動作', 'load page'])
        return Bus.has('reload')
          ? Bus.emit('reload', _ => done(closure))
          : done(closure)

      default:
        return typeof closure == 'function' && closure()
    }
  }

  this.type     = type     => Actions.types.indexOf(type) != -1 ? (_type = type, this) : _type
  this.filepath = filepath => filepath ? (_filepath = filepath, this) : _filepath
  
  let tokens = filepath.replace(Path.entry, '').split(Path.sep).map(t => t.trim()).filter(v => v.length)
  Config.watch.ignoreDirs.indexOf(tokens.shift()) == -1 && Actions.push(this.type(type).filepath(filepath))
}

const watchIcon = closure => Display.lines('啟動 ICON 功能', '執行動作', 'watch ' + Path.icon.replace(Path.root, '') + 'style.css') && require('chokidar')
  .watch(require('../WindowPath')(Path.icon))
  .on('change', file  => IconAction(Actions.rebuild, file))
  .on('add',    file  => IconAction(Actions.create,  file))
  .on('unlink', file  => IconAction(Actions.remove,  file))
  .on('error',  error => Notifier('[ICON 目錄] 錯誤！', '監控目錄發生錯誤', '請至終端機確認錯誤原因！') && Display.line(false, error.message))
  .on('ready',  _ => Actions.wait(closure))

const watchScss = closure => Display.lines('啟動 SCSS 功能', '執行動作', 'watch ' + Path.scss.replace(Path.root, '') + '*.scss') && CompassCompile(_ => require('chokidar')
  .watch(require('../WindowPath')(Path.scss + '**' + Path.sep + '*.scss'))
  .on('change', file  => compassInited && ScssAction(Actions.rebuild, file))
  .on('add',    file  => compassInited && ScssAction(Actions.create,  file))
  .on('unlink', file  => compassInited && ScssAction(Actions.remove,  file))
  .on('error',  error => compassInited && Notifier('[SCSS 目錄] 錯誤！', '監控目錄發生錯誤', '請至終端機確認錯誤原因！') && Display.line(false, error.message))
  .on('ready',  _ => Actions.wait(_ => (compassInited = true) && closure())))

const watchFile = closure => Display.lines('監控 FILE 檔案', '執行動作', 'watch ' + Config.watch.formats.join('、') + ' 檔案') &&
  Promise.all(Config.watch.formats.map(format => new Promise((resolve, reject) => require('chokidar')
    .watch(require('../WindowPath')(Path.entry + '**' + Path.sep + '*' + format))
    .on('change', file  => Path.extname(file) == format && FileAction(Actions.rebuild, file))
    .on('add',    file  => Path.extname(file) == format && FileAction(Actions.create, file))
    .on('unlink', file  => Path.extname(file) == format && FileAction(Actions.remove, file))
    .on('error',  error => reject({ format: format, message: error.message }))
    .on('ready',  resolve))))
  .catch(error => Notifier('[' + error.format + '] 錯誤！', '監控目錄發生錯誤', '請至終端機確認錯誤原因！') && Display.line(false, error.message))
  .then(_ => Actions.wait(closure))

Bus.on('readied', status => readied = status)

module.exports = closure =>
  Display.title('啟動專案') && Actions.run() &&
  watchIcon(_ =>
    watchScss(_ =>
      watchFile(
        closure)))
