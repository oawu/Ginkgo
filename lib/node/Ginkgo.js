/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path     = require('path')

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

const timeUnit = startAt => {
  let now = parseInt((new Date().getTime() - startAt) / 1000, 10)
  
  if (now === 0)
    return '太快了…'

  let units = []

  const contitions = [
    { base: 60, format: '秒' },
    { base: 60, format: '分鐘' },
    { base: 24, format: '小時' },
    { base: 30, format: '天' },
    { base: 12, format: '個月' },
  ]

  for (var i in contitions) {
    let nowUnit = now % contitions[i].base
    
    if (nowUnit != 0)
      units.push(nowUnit + contitions[i].format)

    now = Math.floor(now / contitions[i].base)
    if (now < 1)
      break
  }

  if (now > 0)
    units.push(now + '年')

  if (units.length < 1)
    units.push(now + '秒')

  return units.reverse().join(' ')
}

module.exports = {
  bus: bus,
  print: print,
  notifier: notifier,
  timeUnit: timeUnit,
  load: name => require('./' + name),
  loadWatch: name => require('./watch/' + name),
  loadDeploy: name => require('./deploy/' + name),
  loadZip: name => require('./zip/' + name)
}
