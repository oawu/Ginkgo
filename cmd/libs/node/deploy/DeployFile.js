/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const windowPath = require('../Ginkgo').windowPath
const GetYamlFile = require('../Ginkgo').getYamlFile
const Display     = require('../Display')
const Xterm       = require('../Xterm')
const Rollback    = require('./Rollback')
const Argv        = require('./Argv')
const Path        = require('path')

const localFiles =
  (title, localFiles, closure) => true &&
    Display.line(title) &&
    Display.line(localFiles.length) &&

    (Argv.localFiles = localFiles.map(
      file => Display.line() && {
        name: process.platform === 'win32'
          ? windowPath((Argv.data.folder.length ? Argv.data.folder + Path.sep : '') + file.replace(Path.root, ''))
          : (Argv.data.folder.length ? Argv.data.folder + Path.sep : '') + file.replace(Path.root, ''),
        path: file })) &&

    Display.line(true) && closure && closure()

module.exports = (title, minifyClosure, notMinifyClosure) => {
  Display.title(title)
  
  Display.lines('讀取設定檔案',
    ['執行動作', 'read deploy.rule.yaml'])

  if (!require('fs').existsSync(Path.yaml))
    return Display.line(false) || Rollback(['deploy.rule.yaml 不存在！'])

  let yaml = require('fs').readFileSync(Path.yaml, 'utf8')
  Display.line(true)

  Display.lines('轉譯設定檔案',
    ['執行動作', 'compile deploy.rule.yaml'])

  yaml = GetYamlFile(yaml)
  if (typeof yaml.error !== 'undefined')
    return Display.line(false) || Rollback(['轉譯 deploy.rule.yaml 失敗！', yaml.error.message])
  Display.line(true)

 return localFiles('整理本機內檔案', yaml,
  () => Argv.data.minify
    ? minifyClosure && minifyClosure()
    : notMinifyClosure && notMinifyClosure())
}