/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2020, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Block = function(...argvs) {
  return this instanceof Block
    ? this.actions(argvs)
    : new Block(...argvs)
}

Block.prototype.actions = function(actions) { return this._actions = actions, this }
Block.prototype.total = function(total) { return this._total = total, this }
Block.prototype.doing = function(doing) { return this._doing = doing, this }
Block.prototype.go = function(closure) {
  Progress.doing(...this._actions).total(this._total || 1)
  this._doing({
      get counter () { Progress.do() },
      total (total) {
        return Progress.total(total), this
      },
      success (...argvs) {
        Progress.success(...argvs)
        closure && closure(true, this._result)
      },
      failure (...argvs) {
        Progress.failure(...argvs)
        closure && closure(false, this._result)
      },
      result (result) {  return this._result = result, this }
    })
}

const Progress = {
  index: 0,
  count: 0,
  lines: [],
  color: null,

  print: (...strs) => process.stdout.write("\r" + strs.join('')),

  error (...errors) {
    this.color
      ? errors.length && this.print("\n" + ' ' + this.color.red('【錯誤訊息】') + "\n" + errors.map(error => ' '.repeat(3) + this.color.purple('◉') + ' ' + (error instanceof Error ? error.message : error) + "\n").join('') + "\n")
      : errors.length && this.print("\n" + ' ' + '【錯誤訊息】' + "\n" + errors.map(error => ' '.repeat(3) + '◉' + ' ' + (error instanceof Error ? error.message : error) + "\n").join('') + "\n")

    process.emit('SIGINT')
  },
  doing (...actions) {
    return actions.length
      ? this.color
        ? (this.lines = actions.map((t, i) => '\x1b[K' + ' '.repeat(3 + (i ? 2 : i * 2)) + t.replace(/(^\s*)/g, '$1' + (i ? this.color.purple('↳').dim() : this.color.purple('◉')) + ' ')), this.print(this.lines.join("\n") + this.color.lBlack('…').dim() + ' '))
        : (this.lines = actions.map((t, i) => '\x1b[K' + ' '.repeat(3 + (i ? 2 : i * 2)) + t.replace(/(^\s*)/g, '$1' + (i ? '↳' : '◉') + ' ')), this.print(this.lines.join("\n") + '…' + ' '))
      : this.do(), this
  },
  do () {
    return this.index += 1, this.index > this.count && (this.index = this.count), this.percent(), this
  },
  percent(text) {
    const percent = _ => {
      return _ = this.count ? Math.ceil(this.index * 100) / this.count : 100, _ = parseInt(_ <= 100 ? _ >= 0 ? _ : 0 : 100, 10), (_ < 100 ? _ < 10 ? '  ' + _ : ' ' + _ : _) + '%'
    }
    const lines = [...this.lines]

    if (this.color)
      lines[0] += this.color.gray('(' + this.index + '/' + this.count + ')').dim() + ' ' + this.color.lBlack('─').dim() + ' ' + percent() + (text ? ' ' + this.color.lBlack('─').dim() + ' ' + text : '')
    else
      lines[0] += '(' + this.index + '/' + this.count + ')' + ' ' + '─' + ' ' + percent() + (text ? ' ' + '─' + ' ' + text : '')

    return this.print((lines.length > 1 ? '\x1b[' + (lines.length - 1) + 'A' : '') + "\r" + lines.join("\n")), this
  },
  clean() {
    return this.lines = [], this.index = 0, this.count = 0, this
  },
  total (total) {
    return this.count = total, this.index = 0, this.percent()
  },
  success (message) {
    return this.index = this.count,
      message = typeof message === 'string' ? message : '完成',
      this.percent(this.color ? this.color.green(message) : message).clean(),
      this.print("\n"),
      this
  },
  failure (message, ...error) {
    return message = typeof message === 'string' ? message : '錯誤',
      this.percent(this.color ? this.color.red(message) : message),
      this.print("\n"),
      error.length && this.error(...error),
      this
  },
  okla (message) {
    return this.success(message)
  },
  cmd (desc, action) {
    if (this.color)
      return this.color.lGray(desc).dim() + this.color.gray('：').dim() + this.color.lGray(action).dim().italic()
    else
      return desc + '：' + action
  },
  block: (...argvs) => {
    return Block(...argvs)
  }
}

module.exports = Progress
