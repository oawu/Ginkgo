/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */


const Display = require('../Display')
const Config  = require(require('path').config).watch

const Actions = []
Actions.rebuild = 'rebuild'
Actions.create = 'create'
Actions.remove = 'remove'
Actions.types = [Actions.rebuild, Actions.create, Actions.remove]

Actions.run = () => (Actions.length
  ? Actions[0].run(_ => Actions.shift() && Actions.run())
  : setTimeout(Actions.run, Config.runTimer), true)

Actions.wait = closure => setTimeout(_ => Actions.length
  ? Actions.wait(closure)
  : Display.line(true) && typeof closure == 'function' && closure(), Config.waitTimer)

module.exports = Actions
