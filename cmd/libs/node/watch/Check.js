/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display = require('../Display')
const Xterm   = require('../Xterm')

module.exports = closure => true &&
  Display.lines('檢查是否有 Compass 指令',
    ['執行動作', 'check compass command']) &&

  require('command-exists').sync('compass') ? Display.line(true) && closure && closure() : Display.line(false, '找不到 Compass 指令，部署過程中會使用到 Compass 指令！')
