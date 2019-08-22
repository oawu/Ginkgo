/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path = require('path')

const print = str => {
  process.stdout.write('\r' + str)
  return true
}

let notifierEnable = true
const notifier = (title, subtitle, message) => {
  
  let Notifier = require('node-notifier').NotificationCenter

  notifierEnable && new Notifier().notify({
    title: title,
    subtitle: subtitle,
    message: message,
    sound: true,
    wait: false,
    timeout: 5,
    closeLabel: '關閉',
    actions: ['不再顯示'],
    dropdownLabel: '其他',
  }, (e, r, m) => notifierEnable = !(r == 'activate' && m.activationValue == '不再顯示'))

  return true
}

const bus = {
  events: {},
  on: (name, closure) => {
    if (typeof bus.events[name] === 'undefined')
      bus.events[name] = []
    bus.events[name].push(closure)
  },
  call: (name, ...params) => {
    if (typeof bus.events[name] === 'undefined')
      return
    for (i in bus.events[name])
      bus.events[name][i](params)
  }
}

module.exports = {
  bus: bus,
  print: print,
  notifier: notifier,
  load: name => require('./' + name),
  loadWatch: name => require('./watch/' + name)
}
