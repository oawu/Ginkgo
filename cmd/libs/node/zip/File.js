/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const GetYamlFile = require('../Ginkgo').getYamlFile
const Display     = require('../Display')
const Xterm       = require('../Xterm')
const ReadFile    = require('fs').readFileSync
const FileStat    = require('fs').statSync
const Path        = require('path')

const files = (title, files, closure) => true &&
  Display.line(title) &&
  Display.line(files.length) &&
  (files = files.map(file => Display.line() && { name: file.replace(Path.root, ''), buffer: ReadFile(file), size: FileStat(file).size })) &&
  Display.line(true) && closure && closure(files)

module.exports = (title, closure) => {
  Display.title(title)
  
  Display.lines('讀取設定檔案',
    ['執行動作', 'read deploy.rule.yaml'])

  if (!require('fs').existsSync(Path.yaml))
    return Display.line(false, 'deploy.yaml 不存在！')

  let yaml = require('fs').readFileSync(Path.yaml, 'utf8')
  Display.line(true)

  Display.line('轉譯設定檔案',
    Xterm.color.gray('執行動作', true).dim() + Display.markSemicolon() + Xterm.color.gray('compile deploy.yaml', true).dim().italic())

  yaml = GetYamlFile(yaml)
  if (typeof yaml.error !== 'undefined')
    return Display.line(false, ['轉譯 deploy.yaml 失敗！', yaml.error.message])
  Display.line(true)

  return files('整理檔案格式', yaml, closure)
}