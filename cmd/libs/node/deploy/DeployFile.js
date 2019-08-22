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
const Path        = require('path')

const localFiles = (title, localFiles, closure) => {

  Display.line(title)
  Display.line(localFiles.length)

  localFiles = localFiles.map(
    localFile => Display.line() && {
      name: (Argv.data.folder.length ? Argv.data.folder + '/' : '') + localFile.replace(Path.root, ''),
      path: localFile
    })

  Display.line(true)

  Argv.localFiles = localFiles

  return closure && closure()
}

module.exports = (title, minifyClosure, notMinifyClosure) => {
  Display.title(title)
  
  Display.line('讀取設定檔案',
    Xterm.color.gray('執行動作', true).dim() + Display.markSemicolon() + Xterm.color.gray('read deploy.yaml', true).dim().italic())

  if (!require('fs').existsSync(Path.yaml))
    return Display.line(false) || Rollback(['deploy.yaml 不存在！'])

  let yaml = require('fs').readFileSync(Path.yaml, 'utf8')
  Display.line(true)


  Display.line('轉譯設定檔案',
    Xterm.color.gray('執行動作', true).dim() + Display.markSemicolon() + Xterm.color.gray('compile deploy.yaml', true).dim().italic())

  yaml = GetYamlFile(yaml)
  if (typeof yaml.error !== 'undefined')
    return Display.line(false) || Rollback(['轉譯 deploy.yaml 失敗！', yaml.error.message])
  Display.line(true)

 return localFiles('整理本機內檔案', yaml,
  () => Argv.data.minify
    ? minifyClosure && minifyClosure()
    : notMinifyClosure && notMinifyClosure())
}