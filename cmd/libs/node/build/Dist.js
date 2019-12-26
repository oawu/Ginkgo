/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path        = require('path')
const Exec        = require('child_process').execSync
const Display     = require('../Display')
const ScanDir     = require('../ScanDir')
const FileSystem  = require('fs')
  const Mkdir     = FileSystem.mkdirSync
  const Exists    = FileSystem.existsSync
  const FileCopy  = FileSystem.copyFileSync
  const FileRead  = FileSystem.readFileSync
  const FileWrite = FileSystem.writeFileSync
  const CopyFile  = FileSystem.copyFileSync
  const Access    = FileSystem.accessSync
  const WriteAble = FileSystem.constants.W_OK
  const ReadAble  = FileSystem.constants.R_OK

const OAMkdir = dir => {
  if (Exists(dir)) return true
  try { Mkdir(dir, { recursive: true }) } catch (e) { }
  return !!Exists(dir)
}

const distExist = _ =>
  Display.lines('檢查 Dist 目錄是否存在', '執行動作', 'check dist is exist') &&
  OAMkdir(Path.dist)
    ? Display.line(true)
    : Display.line(false, '新增失敗，請檢查目錄是否可以寫入！')

const distWrite = _ => {
  Display.lines('檢查 Dist 目錄是否可以讀寫', '執行動作', 'check dist dir is writeable')
  try { Access(Path.dist, WriteAble) }
  catch (e) { Display.line(false, ['目錄不可讀寫，請檢查目錄權限！', e]) }
  return Display.line(true)
}

const distClean = _ => {
  Display.lines('清空 Dist 目錄', '執行指令', 'rm -rf dist/*')
  try { Exec('rm -rf ' + Path.dist) }
  catch (e) { Display.line(false, ['執行指令 rm -rf dist/* 時發生錯誤！', e]) }
  return Display.line(true)
}

const distBuild = _ => {
  Display.lines('掃描 src 目錄', '執行動作', 'scan ' + Path.relative(Path.root, Path.src) + ' dir')
  let files = ScanDir(Path.src).map(file => ({ dist: Path.normalize(Path.dist + Path.dirname(file).substr(Path.src.length) + Path.sep + Path.basename(file, '.php') + (Path.extname(file) === '.php' ? '.html' : '')), src: file }))
  Display.line(files.length)
  Display.line(true)
  
  Display.lines('搬移與編譯 View 目錄', '執行動作', 'copy & build ' + Path.relative(Path.root, Path.src) + ' dir')
  const gitignoreExists = Exists(Path.dist + '.gitignore')

  Display.line(files.length + (!gitignoreExists ? 2 : 1))

  OAMkdir(Path.dist) || Display.line(false, '無法在 Dist 建立目錄「' + Path.dist + '」！')
  Display.line()

  if (!gitignoreExists) {
    try { FileWrite(Path.dist + '.gitignore', '*' + Display.LN, 'utf8') }
    catch (e) { Display.line(false, ['寫入「' + Path.dist + '.gitignore」時發生錯誤！', e]) }
    Display.line()
  }

  const Babel = require("@babel/core");
  const MinifyHTML = require('html-minifier').minify
  const CleanCSS = require('clean-css')

  files = files.map(file => {
    const Config = require(Path.config)
    const ext = Path.extname(file.src)

    let content = ''
    let dist = Path.dirname(file.dist) + Path.sep
    OAMkdir(dist) || Display.line(false, '無法在 Dist 建立目錄「' + dist + '」！')

    try { Access(file.src, ReadAble) }
    catch (e) { return Config.ignorePermission || Display.line(false, ['檔案不可讀取，請檢查目錄權限！', '檔案：' + file.src.replace(Path.root, ''), e.message]) }

    switch (ext) {
      case '.php':
        try { content = Exec('php ' + Path.phpEntry + ' --path ' + file.src + (Config.argvs.length ? ' ' + Config.argvs.join(' ') : ''), { maxBuffer: 1024 * 500 , stdio: 'pipe', encoding: 'utf8' }).toString() } catch (e) { return ['編譯 PHP「' + file.src.substr(Path.src.length) + '」時發生錯誤！', '錯誤原因：' + e.stdout] }
        if (Config.minify) {
          try { content = MinifyHTML(content, { collapseWhitespace: true, continueOnParseError: false }) } catch (e) { return Display.line(false, ['壓縮檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
          if (content === null) return Display.line(false, ['壓縮檔案「' + file.src.substr(Path.src.length) + '」時失敗！'])
        }
        try { FileWrite(file.dist, content, 'utf8') } catch (e) { return Display.line(false, ['寫入檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
        return Display.line()

      case '.html':
        try { content = FileRead(file.src, 'utf8') } catch (e) { return Display.line(false, ['讀取檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
        if (Config.minify) {
          try { content = MinifyHTML(content, { collapseWhitespace: true, continueOnParseError: false }) } catch (e) { return Display.line(false, ['壓縮檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
          if (content === null) return Display.line(false, ['壓縮檔案「' + file.src.substr(Path.src.length) + '」時失敗！'])
        }
        try { FileWrite(file.dist, content, 'utf8') } catch (e) { return Display.line(false, ['寫入檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
        return Display.line()

      case '.js':
        try { content = FileRead(file.src, 'utf8') } catch (e) { return Display.line(false, ['讀取檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
        if (Config.minify) {
          if (!/\.min$/.test(Path.basename(file.src, '.js'))) {
            try { content = Babel.transformSync(content, { presets: ['@babel/preset-env', 'minify'] }).code } catch (e) { return Display.line(false, ['轉換、轉換檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
          }
        }
        try { FileWrite(file.dist, content, 'utf8') } catch (e) { return Display.line(false, ['寫入檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
        return Display.line()

      case '.css':
        try { content = FileRead(file.src, 'utf8') } catch (e) { return Display.line(false, ['讀取檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
        if (Config.minify) {
          try { content = new CleanCSS({}).minify(content.replace(/\}\n+/gm, '}')).styles } catch (e) { return Display.line(false, ['壓縮檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
        }
        try { FileWrite(file.dist, content, 'utf8') } catch (e) { return Display.line(false, ['寫入檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
        return Display.line()

      default:
        try { CopyFile(file.src, file.dist) } catch (e) { return Display.line(false, ['搬移檔案「' + file.src.substr(Path.src.length) + '」時失敗！', '錯誤原因：' + e.message]) }
        return Display.line()
    }

    return Display.line()
  })

  return Display.line(true)
}

module.exports = closure =>
  Display.title('整理 Dist 目錄') &&
  distExist() &&
  distWrite() &&
  distClean() &&
  distBuild() &&
  typeof closure == 'function' &&
  closure()
