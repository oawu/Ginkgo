/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const FileSystem = require('fs')
const Exec    = require('child_process').exec
const ExecSync        = require('child_process').execSync

let App      = null
let Color    = null
let Path     = null
let Sep      = null
let Progress = null

const Mkdir = dir => {
  if (FileSystem.existsSync(dir)) return true
  try { FileSystem.mkdirSync(dir, { recursive: true }) } catch (e) { }
  return !!FileSystem.existsSync(dir)
}

const ScanDir = dir => FileSystem.existsSync(dir) ? FileSystem.readdirSync(dir).map(file => file !== '.' && file !== '..' ? FileSystem.statSync(dir + file).isDirectory() ? ScanDir(dir + file + Sep) : [dir + file] : null).filter(t => t !== null).reduce((a, b) => a.concat(b), []) : []

const filesDir = (progress, files, minify, copy) => {
  let isExist = {}
  for (let file of files) {
    let dist = Path.dirname(file.dist) + Path.sep
    if (isExist[dist] === undefined) Mkdir(dist) || Progress.failure(null, '無法在 Dist 建立目錄「' + Path.relative(App.path('root'), dist) + Sep + '」！'), isExist[dist] = true
    
    copy === undefined && (copy = (file, error) => {
      try { FileSystem.copyFileSync(file.src, file.dist) }
      catch (e) { error(e) }
    })

    App.config.build.minify && minify !== undefined
      ? minify(file, e => Progress.failure(null, '處理檔案「' + Path.relative(App.path('entry'), file.src) + '」時失敗！', e))
      : copy(file, e => Progress.failure(null, '複製檔案「' + Path.relative(App.path('entry'), file.src) + '」時失敗！', e))

    Progress.do()
  }
  progress.success()
}

module.exports = (app, closure) => {
  App = app,
    Color = App.color,
    Progress = App.progress,
    Path = App.path('$'),
      Sep = Path.sep

  process.stdout.write("\n" + ' ' + Color.yellow('【編譯並輸出目錄】') + "\n")

  const queue = new App.queue()

  const active1 = App.config.build.minify ? '處理' : '複製'
  const active2 = App.config.build.minify ? 'modify' : 'copy'
  const minDist  = Path.relative(App.path('root'), App.path('dest'))  + Sep
  const minEntry = Path.relative(App.path('root'), App.path('entry')) + Sep
  const CleanCSS = require('clean-css')
  const Babel = require("@babel/core");
  const MinifyHTML = require('html-minifier').minify
  const build = (file, cmds, error, write) => { try { write(ExecSync([...cmds, '--path', file.src].join(' '), { maxBuffer: App.config.enablePHP.maxBuffer, stdio: 'pipe', encoding: 'utf8' }).toString()) } catch (e) { error(e) } }

  queue.enqueue(next => Progress.block('檢查輸出目錄是否存在', Progress.cmd('執行動作', 'check ' + minDist + ' is exist'))
    .doing(progress => Mkdir(App.path('dest'))
      ? progress.success()
      : progress.failure(null, '新增失敗，請檢查目錄是否可以寫入！', minDist))
    .go(next))

  queue.enqueue(next => Progress.block('檢查輸出目錄是否可以讀寫', Progress.cmd('執行動作', 'check ' + minDist + ' is writeable'))
    .doing(progress => FileSystem.promises.access(App.path('dest'), FileSystem.constants.W_OK)
      .then(_ => progress.success())
      .catch(e => progress.failure(null, '目錄不可讀寫，請檢查目錄權限！', e)))
    .go(next))

  queue.enqueue(next => Progress.block('清空輸出目錄', Progress.cmd('執行指令', 'rm -rf ' + minDist + '*'))
    .doing(progress => Exec('rm -rf ' + App.path('dest'), (error, stdout, stderr) => error
      ? progress.failure(null, '執行指令 rm -rf ' + minDist + '* 時發生錯誤！', error)
      : progress.success()))
    .go(next))

  queue.enqueue(next => Progress.block('掃描開發目錄', Progress.cmd('執行動作', 'scan ' + minEntry + ' dir'))
    .doing(progress => progress.result(ScanDir(App.path('entry'))
      .filter(file => !App.config.build.ignoreDirs.filter(dir => file.match(dir)).length)
      .map(file => {
        const extension = Path.extname(file).toLowerCase()
        const isPHP = App.config.enablePHP && extension == '.php'
        const dist = Path.normalize(App.path('dest') + Path.relative(App.path('entry'), Path.dirname(file)) + Sep + Path.basename(file).replace(/\.php$/gmi, '') + (extension == '.php' ? '.html' : ''))
        return { src: file, isPHP, dist, extension }})
      .filter(file => (!App.config.build.exts || App.config.build.exts.indexOf(file.extension) != -1))).success())
    .go((_, files) => next(files)))

  queue.enqueue((next, files) => Progress.block('整理分類檔案', Progress.cmd('執行動作', 'dispatch ' + minEntry + ' files'))
    .total(5)
    .doing(progress => {
      const cssFiles = files.filter(file => file.extension == '.css')
      progress.counter

      const jsFiles = files.filter(file => file.extension == '.js')
      progress.counter
      
      const htmlFiles = files.filter(file => file.extension == '.html')
      progress.counter
      
      const phpFiles = files.filter(file => file.isPHP)
      progress.counter
      
      const otherFiles = files.filter(file => !file.isPHP && file.extension != '.js' && file.extension != '.css' && file.extension != '.html')
      progress.result({ cssFiles, jsFiles, htmlFiles, phpFiles, otherFiles }).success()
    })
    .go((_, files) => next(files)))
  
  queue.enqueue((next, files) => Progress.block('檢查 .gitignore 檔案是否存在', Progress.cmd('執行動作', 'check .gitignore file is exist'))
    .doing(progress => FileSystem.existsSync(App.path('dest') + '.gitignore')
      ? progress.result(files).success('存在')
      : progress.result(files).failure('不存在'))
    .go((isSuccess, files) => next({ isSuccess, files })))

  queue.enqueue((next, prev) => prev.isSuccess ? next(prev.files) : Progress.block('建立 .gitignore 檔案', Progress.cmd('執行動作', 'create .gitignore file'))
    .total(2)
    .doing(progress => {
      Mkdir(App.path('dest')) || progress.failure(null, '新增失敗，請檢查目錄是否可以寫入！', minDist)
      progress.counter

      FileSystem.writeFile(App.path('dest') + '.gitignore', '*' + "\n", 'utf8', error => error
          ? progress.failure(null, '建立 .gitignore 時發生錯誤！', error)
          : progress.result(prev.files).success(''))
    })
    .go((_, files) => next(files)))

  queue.enqueue((next, files) => Progress.block(active1 + ' CSS 檔案', Progress.cmd('執行動作', active1 + ' .css files'))
    .total(files.cssFiles.length)
    .doing(progress => filesDir(progress, files.cssFiles, (file, error) => {
      try { FileSystem.writeFileSync(file.dist, new CleanCSS({}).minify(FileSystem.readFileSync(file.src, 'utf8')).styles, 'utf8') }
      catch (e) { error(e) }
    }))
    .go(_ => next(files)))

  queue.enqueue((next, files) => Progress.block(active1 + ' JavaScript 檔案', Progress.cmd('執行動作', active1 + ' .js files'))
    .total(files.jsFiles.length)
    .doing(progress => filesDir(progress, files.jsFiles, (file, error) => {
      try { FileSystem.writeFileSync(file.dist, Babel.transformSync(FileSystem.readFileSync(file.src, 'utf8'), { presets: [...App.config.build.jsPresets, 'minify'] }).code, 'utf8') }
      catch (e) { error(e) }
    }))
    .go(_ => next(files)))

  queue.enqueue((next, files) => Progress.block(active1 + ' HTML 檔案', Progress.cmd('執行動作', active1 + ' .html files'))
    .total(files.htmlFiles.length)
    .doing(progress => filesDir(progress, files.htmlFiles, (file, error) => {
      try { FileSystem.writeFileSync(file.dist, MinifyHTML(FileSystem.readFileSync(file.src, 'utf8'), { collapseWhitespace: true, continueOnParseError: false }), 'utf8') }
      catch (e) { error(e) }
    }))
    .go(_ => next(files)))

  queue.enqueue((next, files) => Progress.block('編譯 PHP 檔案', Progress.cmd('執行動作', 'build .php files'))
    .total(files.phpFiles.length)
    .doing(progress => {
      const cmds = ['php', App.path('lib-php-main')]

      for (let key in App.config.build.argvs)
        cmds.push(key, App.config.build.argvs[key])

      filesDir(progress, files.phpFiles, (file, error) => build(file, cmds, error, data => {
        try { FileSystem.writeFileSync(file.dist, MinifyHTML(data, { collapseWhitespace: true, continueOnParseError: false }), 'utf8') }
        catch (e) { error(e) }
      }) , (file, error) => build(file, cmds, error))
    })
    .go(_ => next(files)))

  queue.enqueue((next, files) => Progress.block('複製其他檔案', Progress.cmd('執行動作', 'copy other files'))
    .total(files.otherFiles.length)
    .doing(progress => filesDir(progress, files.otherFiles))
    .go(closure))
}
