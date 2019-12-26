/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path    = require('path')
const Exec    = require('child_process').exec
const Display = require('../Display')
const Config  = require(Path.config)
const FileSystem  = require('fs')
  const Exists    = FileSystem.existsSync
  const Unlink    = FileSystem.unlink
  const FileWrite = FileSystem.writeFile
  const FileRead  = FileSystem.readFile

let gitignore = null

const writeGitignore = closure =>
  Display.linesM('於 dest 目錄內建立 .gitignore 檔案', ['執行指令', 'cd ' + Path.relative(Path.root, Path.dest) + Path.sep + ''], ['執行動作', 'write .gitignore']) &&
  FileWrite(Path.dest + '.gitignore', gitignore, 'utf8', (error, written, string) => error ? Display.line(false, ['建立檔案失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

const readGitignore = closure =>
  Display.linesM('於 dest 目錄暫存 .gitignore 檔案', ['執行指令', 'cd ' + Path.relative(Path.root, Path.dest) + Path.sep + ''], ['執行動作', 'read .gitignore']) &&
  FileRead(Path.dest + '.gitignore', 'utf8', (error, data) => error ? Display.line(false, ['讀取失敗！', '錯誤訊息：' + error.message]) : (Display.line(true) && (gitignore = data), typeof closure == 'function' && closure()))

const unlinkGitignore = closure =>
  Display.linesM('於 dest 目錄移除 .gitignore 檔案', ['執行指令', 'cd ' + Path.relative(Path.root, Path.dest) + Path.sep + ''], ['執行指令', 'rm .gitignore']) &&
  Unlink(Path.dest + '.gitignore', error => error ? Display.line(false, ['移除失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

const checkGitignore = closure => 
  Display.linesM('於 dest 目錄檢查是否有 .gitignore 檔案', ['執行指令', 'cd ' + Path.relative(Path.root, Path.dest) + Path.sep + ''], ['執行動作', 'check .gitignore is exists']) &&
  Exists(Path.dest + '.gitignore')
    ? Display.line(false) || readGitignore(_ => unlinkGitignore(closure))
    : Display.line(true, '否') && typeof closure == 'function' && closure()

const init = closure =>
  Display.linesM('於 dest 目錄內建立 git', ['執行指令', 'cd ' + Path.relative(Path.root, Path.dest) + Path.sep + ''], ['執行指令', 'git init']) &&
  Exists(Path.dest + '.git')
    ? remove(_ => init(closure))
    : Exec('cd ' + Path.dest + ' && git init', (error, stdout, stderr) => error ? Display.line(false, ['初始化失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

const all = closure =>
  Display.linesM('於 dest 目錄內所有檔案加入 git', ['執行指令', 'cd ' + Path.relative(Path.root, Path.dest) + Path.sep + ''], ['執行指令', 'git add --all']) &&
  Exec('cd ' + Path.dest + ' && git add --all', (error, stdout, stderr) => error ? Display.line(false, ['加入檔案失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

const commit = closure =>
  Display.linesM('於 dest 目錄內建立 git commit 紀錄', ['執行指令', 'cd ' + Path.relative(Path.root, Path.dest) + Path.sep + ''], ['執行指令', 'git commit --message "' + Config.github.commitMessage + '"']) &&
  Exec('cd ' + Path.dest + ' && git commit --message "' + Config.github.commitMessage + '" --allow-empty', (error, stdout, stderr) => error ? Display.line(false, ['建立紀錄失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

const push = closure =>
  Display.linesM('於 dest 目錄內 git push 至 github page', ['執行指令', 'cd ' + Path.relative(Path.root, Path.dest) + Path.sep + ''], ['執行指令', 'git push --force git@github.com:' + Config.github.account + '/' + Config.github.repository + '.git master:' + Config.github.pageBranch]) &&
  Exec('cd ' + Path.dest + ' && git push --force git@github.com:' + Config.github.account + '/' + Config.github.repository + '.git master:' + Config.github.pageBranch, (error, stdout, stderr) => error ? Display.line(false, ['執行失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

const remove = closure =>
  Display.linesM('於 dest 目錄刪除 git', ['執行指令', 'cd ' + Path.relative(Path.root, Path.dest) + Path.sep + ''], ['執行指令', 'rm -rf ' + Path.dest + '.git']) &&
  Exec('cd ' + Path.dest + ' && rm -rf ' + Path.dest + '.git', (error, stdout, stderr) => error ? Display.line(false, ['執行失敗！', '錯誤訊息：' + error.message]) : Display.line(true) && typeof closure == 'function' && closure())

// const status = (closure1, closure2) => 
//   Display.linesM('於 dest 目錄檢查 git 狀態', ['執行指令', 'cd ' + Path.relative(Path.root, Path.dest) + Path.sep + ''], ['執行指令', 'git status --porcelain']) &&
//   Exec('cd ' + Path.dest + ' && git status --porcelain', (error, stdout, stderr) => !error
//     ? !stdout.length
//       ? Display.line(true) && typeof closure1 == 'function' && closure1()
//       : Display.line(true) && typeof closure2 == 'function' && closure2()
//     : Display.line(false, ['加入檔案失敗！', '錯誤訊息：' + error.message]))

module.exports = closure =>
  Display.title('部署至 Github Page') &&
  checkGitignore(_ => 
    init(_ =>
      all(_ =>
        commit(_ =>
          push(_ =>
            remove(_ =>
              gitignore
                ? writeGitignore(closure)
                : closure()))))))
