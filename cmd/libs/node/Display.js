/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const print = require('./Ginkgo').print
const Xterm = require('./Xterm')

class Display {
  static mainTitle(str, isReturn) {
    str = Display.LN + ' ' + Xterm.color.gray('§').dim() + ' ' + Xterm.color.gray(str, true).blod() + Display.LN
    return isReturn ? str : print(str)
  }

  static title(str, isReturn) {
    str = Display.LN + ' ' + Xterm.color.yellow('【' + str + '】') + Display.LN
    return isReturn ? str : print(str)
  }

  static markListLine(str, isReturn) {
    str = ' '.repeat(3) + Display.markList() + ' ' + str + Display.LN
    return isReturn ? str : print(str)
  }

  static progress() {
    Display.present = Display.total ? Math.ceil(Display.index * 100) / Display.total : 100
    Display.present = Display.present <= 100 ? Display.present >= 0 ? Display.present : 0 : 100
    return Display.present
  }

  static showPresent() {
    let i = parseInt(Display.progress(), 10)
    return (i < 100 ? i < 10 ? '  ' + i : '' + i : i) + '%'
  }

  static line(title, error) {
    if (typeof title === 'string') {
      Display.present = null
      let args = Array.prototype.slice.call(arguments).reduce((a, b) => a.concat(b), []).filter(t => t !== null)
      Display.lines = args.map((t, i) => '\x1b[K' + ' '.repeat(3 + (i ? 2 : i * 2)) + (i ? Display.markHash() : Display.markList()) + ' ' + t.replace(/(^\s*)/g,''))
      print(Display.lines.join(Display.LN) + Xterm.color.black('…', true).dim() + ' ')
    }

    if (typeof title === 'boolean' && Display.lines.length) {
      if (title == true) {
        Display.index = Display.total
        Display.lines[0] += (Display.present !== null ? Xterm.color.gray('(' + Display.index + '/' + Display.total + ')').dim() + ' ' + Xterm.color.black('─', true).dim() + ' ' + Display.showPresent() : '') + ' ' + Xterm.color.black('─', true).dim() + ' ' + Xterm.color.green(typeof error === 'string' ? error : '完成')
        print((Display.lines.length > 1 ? '\x1b[' + (Display.lines.length - 1) + 'A' : '') + Display.LR + Display.lines.join(Display.LN) + Display.LN)
        Display.present = null
        Display.lines = []
      } else {
        Display.lines[0] += (Display.present !== null ? Xterm.color.gray('(' + Display.index + '/' + Display.total + ')').dim() + ' ' + Xterm.color.black('─', true).dim() + ' ' + Display.showPresent() : '') + ' ' + Xterm.color.black('─', true).dim() + ' ' + Xterm.color.red('錯誤')
        print((Display.lines.length > 1 ? '\x1b[' + (Display.lines.length - 1) + 'A' : '') + Display.LR + Display.lines.join(Display.LN) + Display.LN)
        error && Display.error(error)
        Display.present = null
        Display.lines = []
        return false
      }
    }

    if (typeof title === 'number') {
      Display.total = title
      Display.index = 0

      let lines = Display.lines.slice()

      lines[0] += Xterm.color.gray('(' + Display.index + '/' + Display.total + ')').dim() + ' ' + Xterm.color.black('─', true).dim() + ' ' + Display.showPresent()
      print((lines.length > 1 ? '\x1b[' + (lines.length - 1) + 'A' : '') + Display.LR + lines.join(Display.LN))
    }
    
    if (typeof title === 'undefined') {
      Display.index += 1
      let lines = Display.lines.slice()

      lines[0] += Xterm.color.gray('(' + Display.index + '/' + Display.total + ')').dim() + ' ' + Xterm.color.black('─', true).dim() + ' ' + Display.showPresent()
      print((lines.length > 1 ? '\x1b[' + (lines.length - 1) + 'A' : '') + Display.LR + lines.join(Display.LN))
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

    print(Display.LN + ' ' + Xterm.color.red('【錯誤訊息】') + Display.LN)
    print(errors.map(error => ' '.repeat(3) + Display.markList() + ' ' + error + Display.LN).join('') + Display.LN)
    process.exit(1)
  }

  static markHash() {
    return Xterm.color.purple('↳').dim() + ''
  }

  static markList() {
    return Xterm.color.purple('◉') + ''
  }

  static markSemicolon() {
    return Xterm.new('：').dim() + ''
  }
}

Display.LR = '\r'
Display.LN = '\n'
Display.lines = []
Display.total = 0
Display.index = 0
Display.present = null

module.exports = Display
