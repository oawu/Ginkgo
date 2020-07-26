/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2020, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Xterm = function(text) {
  if (!(this instanceof Xterm)) return new Xterm(text)
  this.text = text
  this.codes = []
}

Xterm.prototype = { ...Xterm.prototype,
  toString () { return this.codes.reduce((a, b) => b + a + '\x1b[0m', this.text) },
  blod () { return this.code('\x1b[1m') },
  dim () { return this.code('\x1b[2m') },
  italic () { return this.code('\x1b[3m') },
  underline () { return this.code('\x1b[4m') },
  blink () { return this.code('\x1b[5m') },
  inverted () { return this.code('\x1b[7m') },
  hidden () { return this.code('\x1b[8m') },
  code (code) { return this.codes.push(code), this },
  color (code) { return this.code('\x1b[38;5;' + code + 'm') },
  background (code) { return this.code('\x1b[48;5;' + code + 'm') },
}

Xterm.color = {
  black:   text => Xterm(text).color(0),
  red:     text => Xterm(text).color(1),
  green:   text => Xterm(text).color(2),
  yellow:  text => Xterm(text).color(3),
  blue:    text => Xterm(text).color(4),
  purple:  text => Xterm(text).color(5),
  cyan:    text => Xterm(text).color(6),
  gray:    text => Xterm(text).color(7),

  lBlack:  text => Xterm(text).color(8),
  lRed:    text => Xterm(text).color(9),
  lGreen:  text => Xterm(text).color(10),
  lYellow: text => Xterm(text).color(11),
  lBlue:   text => Xterm(text).color(12),
  lPurple: text => Xterm(text).color(13),
  lCyan:   text => Xterm(text).color(14),
  lGray:   text => Xterm(text).color(15),
}

Xterm.background = {
  black:   text => Xterm(text).background(0),
  red:     text => Xterm(text).background(1),
  green:   text => Xterm(text).background(2),
  yellow:  text => Xterm(text).background(3),
  blue:    text => Xterm(text).background(4),
  purple:  text => Xterm(text).background(5),
  cyan:    text => Xterm(text).background(6),
  gray:    text => Xterm(text).background(7),

  lBlack:  text => Xterm(text).background(8),
  lRed:    text => Xterm(text).background(9),
  lGreen:  text => Xterm(text).background(10),
  lYellow: text => Xterm(text).background(11),
  lBlue:   text => Xterm(text).background(12),
  lPurple: text => Xterm(text).background(13),
  lCyan:   text => Xterm(text).background(14),
  lGray:   text => Xterm(text).background(15),
}

module.exports = Xterm
