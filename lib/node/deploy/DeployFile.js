/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const GetYamlFile = require('../Ginkgo').getYamlFile
const Display     = require('../Display')
const Xterm       = require('../Xterm')
const Rollback    = require('./Rollback')
const Argv        = require('./Argv')
const DirRead     = require('fs').readdirSync
const Exists      = require('fs').existsSync
const FileStat    = require('fs').statSync
const Path        = require('path')

const localFiles = (title, outputDir, localFiles, closure) => {

  Display.line(title)
  Display.line(localFiles.length)

  localFiles = localFiles.map(
    localFile => Display.line() && {
      name: (Argv.data.folder.length ? Argv.data.folder + '/' : '') + localFile.replace(outputDir, ''),
      path: localFile
    })

  Display.line(true)

  Argv.localFiles = localFiles

  return closure && closure()
}

const mapDir = (dir, filelist) => {
  const files = DirRead(dir)
  filelist = filelist || []
  files.forEach(file => FileStat(dir + file).isDirectory() ? filelist = mapDir(dir + file + Path.sep, filelist) : filelist.push(dir + file))
  return filelist
}

module.exports = (title, minifyClosure, notMinifyClosure) => {
  Display.title(title)
  
  Display.line('取得 outputDir 設定值',
    Xterm.color.gray('執行動作', true).dim() + Display.markSemicolon() + Xterm.color.gray('get outputDir value', true).dim().italic())

  let outputDir = 'dist'
  if (Exists(Path.root + 'vue.config.js')) {
    let data = require(Path.root + 'vue.config')
    if (typeof data.outputDir !== 'undefined')
      outputDir = data.outputDir
  }
  outputDir = Path.resolve(__dirname, Path.root + outputDir) + Path.sep
  Display.line(true)

  Display.line('掃描 ' + Xterm.color.gray(outputDir, true) + ' 目錄',
    Xterm.color.gray('執行動作', true).dim() + Display.markSemicolon() + Xterm.color.gray('scan ' + outputDir + ' dir', true).dim().italic())

  let files = mapDir(outputDir)
  Display.line(files.length)
  Display.line(true)

  return localFiles('整理本機內檔案', outputDir, files,
    () => Argv.data.minify
      ? minifyClosure && minifyClosure()
      : notMinifyClosure && notMinifyClosure())
}