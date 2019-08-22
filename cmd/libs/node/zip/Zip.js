/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display = require('../Display')
const Xterm   = require('../Xterm')
const AdmZip  = require('adm-zip')

module.exports = (title, closure, files) => {
  Display.title(title)
  Display.line('加入檔案',
    Xterm.color.gray('執行動作', true).dim() + Display.markSemicolon() + Xterm.color.gray('zip add files', true).dim().italic())
  Display.line(files.length)

  const zip = new AdmZip()

  files.forEach(file => Display.line() && zip.addFile(file.name, file.buffer))
  zip.writeZip(require('path').zip)

  return Display.line(true) && closure && closure(files)
}
