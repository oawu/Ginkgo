/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

module.exports = {
  events: {},
  on (name, closure) {
    this.has(name) || (this.events[name] = [])
    this.events[name].push(closure)
    return this
  },
  emit (name, ...params) {
    if (!this.has(name)) return this
    this.events[name].forEach(event => event(...params))
    return this
  },
  has (name) {
    return !!this.events[name]
  }
}
