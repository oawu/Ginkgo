/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

class Xterm {
  static new(str) {
    return new Xterm(str)
  }

  static black(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[38;5;8m'  : '\x1b[38;5;0m')
  }

  static red(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[38;5;9m'  : '\x1b[38;5;1m')
  }

  static green(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[38;5;10m' : '\x1b[38;5;2m')
  }

  static yellow(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[38;5;11m' : '\x1b[38;5;3m')
  }

  static blue(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[38;5;12m' : '\x1b[38;5;4m')
  }

  static purple(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[38;5;13m' : '\x1b[38;5;5m')
  }

  static cyan(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[38;5;14m' : '\x1b[38;5;6m')
  }

  static gray(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[38;5;15m' : '\x1b[38;5;7m')
  }

  static bgBlack(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[48;5;8m'  : '\x1b[48;5;0m')
  }

  static bgRed(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[48;5;9m'  : '\x1b[48;5;1m')
  }

  static bgGreen(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[48;5;10m' : '\x1b[48;5;2m')
  }

  static bgYellow(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[48;5;11m' : '\x1b[48;5;3m')
  }

  static bgBlue(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[48;5;12m' : '\x1b[48;5;4m')
  }

  static bgPurple(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[48;5;13m' : '\x1b[48;5;5m')
  }

  static bgCyan(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[48;5;14m' : '\x1b[48;5;6m')
  }

  static bgGray(str, light) {
    return Xterm.new(str).addCode(light ? '\x1b[48;5;15m' : '\x1b[48;5;7m')
  }

  constructor(str = '') {
    this.codes = []
    this.str = str
  }

  blod() {
    return this.addCode('\x1b[1m')
  }

  dim() {
    return this.addCode('\x1b[2m')
  }

  italic() {
    return this.addCode('\x1b[3m')
  }

  underline() {
    return this.addCode('\x1b[4m')
  }

  blink() {
    return this.addCode('\x1b[5m')
  }

  inverted() {
    return this.addCode('\x1b[7m')
  }

  hidden() {
    return this.addCode('\x1b[8m')
  }

  color(code) {
    return this.addCode('\x1b[38;5;' + code + 'm')
  }

  bgColor(code) {
    return this.addCode('\x1b[48;5;' + code + 'm')
  }

  addCode(code) {
    this.codes.push(code)
    return this
  }

  toString() {
    let str = this.str

    if (str === '')
      return str

    for (var i = 0; i < this.codes.length; i++)
      str = this.codes[i] + str + "\x1b[0m"

    return str
  }
}

Xterm.color = {
  black:  (str, light) => Xterm.black(str, light),
  red:    (str, light) => Xterm.red(str, light),
  green:  (str, light) => Xterm.green(str, light),
  yellow: (str, light) => Xterm.yellow(str, light),
  blue:   (str, light) => Xterm.blue(str, light),
  purple: (str, light) => Xterm.purple(str, light),
  cyan:   (str, light) => Xterm.cyan(str, light),
  gray:   (str, light) => Xterm.gray(str, light),
}

Xterm.bg = {
  black:  (str, light) => Xterm.bgBlack(str, light),
  red:    (str, light) => Xterm.bgRed(str, light),
  green:  (str, light) => Xterm.bgGreen(str, light),
  yellow: (str, light) => Xterm.bgYellow(str, light),
  blue:   (str, light) => Xterm.bgBlue(str, light),
  purple: (str, light) => Xterm.bgPurple(str, light),
  cyan:   (str, light) => Xterm.bgCyan(str, light),
  gray:   (str, light) => Xterm.bgGray(str, light),
}

module.exports = Xterm
