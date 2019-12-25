/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Print = require('./Print')
const Xterm = require('./Xterm')

class Display {
  static mainTitle(str, isReturn) {
    str = Display.LN + ' ' + Xterm.color.gray('§').dim() + ' ' + Xterm.color.gray(str, true) + Display.LN
    return isReturn ? str : (process.stdout.write('\x1b[2J'), process.stdout.write('\x1b[0f'), Print(str))
  }

  static title(str, isReturn) {
    str = Display.LN + ' ' + Xterm.color.yellow('【' + str + '】') + Display.LN
    return isReturn ? str : Print(str)
  }

  static markListLine(str, isReturn) {
    str = ' '.repeat(3) + Display.markList() + ' ' + str + Display.LN
    return isReturn ? str : Print(str)
  }

  static progress() {
    Display._present = Display._total ? Math.ceil(Display._index * 100) / Display._total : 100
    Display._present = Display._present <= 100 ? Display._present >= 0 ? Display._present : 0 : 100
    return Display._present
  }

  static showPresent() {
    let i = parseInt(Display.progress(), 10)
    return (i < 100 ? i < 10 ? '  ' + i : '' + i : i) + '%'
  }

  static line(title, error) {
    if (typeof title === 'string') {
      Display._present = null
      let args = Array.prototype.slice.call(arguments).reduce((a, b) => a.concat(b), []).filter(t => t !== null)
      Display._lines = args.map((t, i) => '\x1b[K' + ' '.repeat(3 + (i ? 2 : i * 2)) + (i ? Display.markHash() : Display.markList()) + ' ' + t.replace(/(^\s*)/g,''))
      Print(Display._lines.join(Display.LN) + Xterm.color.black('…', true).dim() + ' ')
    }

    if (typeof title === 'boolean' && Display._lines.length) {
      if (title == true) {
        Display._index = Display._total
        Display._lines[0] += (Display._present !== null ? Xterm.color.gray('(' + Display._index + '/' + Display._total + ')').dim() + ' ' + Xterm.color.black('─', true).dim() + ' ' + Display.showPresent() : '') + ' ' + Xterm.color.black('─', true).dim() + ' ' + Xterm.color.green(typeof error === 'string' ? error : '完成')
        Print((Display._lines.length > 1 ? '\x1b[' + (Display._lines.length - 1) + 'A' : '') + Display.LR + Display._lines.join(Display.LN) + Display.LN)
        Display._present = null
        Display._lines = []
      } else {
        Display._lines[0] += (Display._present !== null ? Xterm.color.gray('(' + Display._index + '/' + Display._total + ')').dim() + ' ' + Xterm.color.black('─', true).dim() + ' ' + Display.showPresent() : '') + ' ' + Xterm.color.black('─', true).dim() + ' ' + Xterm.color.red('錯誤')
        Print((Display._lines.length > 1 ? '\x1b[' + (Display._lines.length - 1) + 'A' : '') + Display.LR + Display._lines.join(Display.LN) + Display.LN)
        error && Display.error(error)
        Display._present = null
        Display._lines = []
        return false
      }
    }

    if (typeof title === 'number') {
      Display._total = title
      Display._index = 0

      let _lines = Display._lines.slice()

      _lines[0] += Xterm.color.gray('(' + Display._index + '/' + Display._total + ')').dim() + ' ' + Xterm.color.black('─', true).dim() + ' ' + Display.showPresent()
      Print((_lines.length > 1 ? '\x1b[' + (_lines.length - 1) + 'A' : '') + Display.LR + _lines.join(Display.LN))
    }
    
    if (typeof title === 'undefined') {
      Display._index += 1
      let _lines = Display._lines.slice()

      _lines[0] += Xterm.color.gray('(' + Display._index + '/' + Display._total + ')').dim() + ' ' + Xterm.color.black('─', true).dim() + ' ' + Display.showPresent()
      Print((_lines.length > 1 ? '\x1b[' + (_lines.length - 1) + 'A' : '') + Display.LR + _lines.join(Display.LN))
    }
    
    return true
  }

  static error(errors) {
    if (typeof errors === 'undefined')
      process.exit(1)

    if (!Array.isArray(errors))
      errors = [errors]

    if (!errors.length)
      process.exit(1)

    Print(Display.LN + ' ' + Xterm.color.red('【錯誤訊息】') + Display.LN)
    Print(errors.map(error => ' '.repeat(3) + Display.markList() + ' ' + error + Display.LN).join('') + Display.LN)
    process.exit(1)
  }

  static markHash() {
    return process.platform === 'win32'
      ? Xterm.color.purple('*').dim() + ''
      : Xterm.color.purple('↳').dim() + ''
  }

  static markList() {
    return process.platform === 'win32'
      ? Xterm.color.purple('＊') + ''
      : Xterm.color.purple('◉') + ''
  }

  static markSemicolon() {
    return process.platform === 'win32'
      ? '：' + ''
      : Xterm.new('：').dim() + ''
  }

  static lines(...actions) {
    return process.platform === 'win32'
      ? Display.line(
          actions.shift(),
          actions.length ? [actions].filter(t => t !== null).map(
            action => Xterm.color.black(action[0], true).dim() + Xterm.color.black('：', true).dim() + Xterm.color.black(action[1], true).dim()) : [])
      : Display.line(
          actions.shift(),
          actions.length ? [actions].filter(t => t !== null).map(
            action => Xterm.color.gray(action[0], true).dim() + Display.markSemicolon() + Xterm.color.gray(action[1], true).dim().italic()) : [])
  }

  static linesM(title, ...actions) {
    return process.platform === 'win32'
      ? Display.line(
          title,
          actions.filter(t => t !== null).map(
            action => Xterm.color.black(action[0], true).dim() + Xterm.color.black('：', true).dim() + Xterm.color.black(action[1], true).dim()))
      : Display.line(
          title,
          actions.filter(t => t !== null).map(
            action => Xterm.color.gray(action[0], true).dim() + Display.markSemicolon() + Xterm.color.gray(action[1], true).dim().italic()))
  }
}

Display.LR = '\r'
Display.LN = '\n'
Display._lines = []
Display._total = 0
Display._index = 0
Display._present = null

module.exports = Display
