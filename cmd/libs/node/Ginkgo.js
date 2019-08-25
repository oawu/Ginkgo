/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path     = require('path')
const DirRead  = require('fs').readdirSync
const FileStat = require('fs').statSync

const windowPath = str => process.platform === 'win32' ? str.replace(/\\/g, "/") : str

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
    return bus.events[name].push(closure)
  },
  call: (name, ...params) => {
    if (typeof bus.events[name] === 'undefined')
      return
    for (i in bus.events[name])
      bus.events[name][i](params)
    return true
  }
}

const mapDir = (dir, options, filelist) => {
  const files = DirRead(dir)
  filelist = filelist || []

  files.forEach(file => {
    const path = dir + file
    const stat = FileStat(path)

    if (!stat.isDirectory()) {
      if (!options.hidden && file[0] === '.')
        return

      if (options.includes.length && options.includes.indexOf(path) !== -1)
        return filelist.push(path) 

      if (options.excludes.length && options.excludes.indexOf(path) !== -1)
        return

      if (!options.allowEmpty && stat.size <= 0)
        return

      if (options.formats.length && options.formats.indexOf(Path.extname(path).toLowerCase()) !== -1)
        return filelist.push(path) 
    }

    if (stat.isDirectory() && options.recursive)
      filelist = mapDir(path + Path.sep, options, filelist)
  })

  return filelist
}

const getYamlFile = yaml => {
  const Exists = require('fs').existsSync
  try {
    yaml = require('js-yaml').safeLoad(yaml)
    yaml = Array.isArray(yaml) ? yaml : []
    
    yaml = yaml.map(t => {
      if (typeof t.path === 'undefined')
        return null

      t.path = Path.resolve(__dirname, Path.root + t.path) + Path.sep

      if (!Exists(t.path))
        return null

      t = { formats: [], includes: [], excludes: [], hidden: 'No', recursive: 'Yes', allowEmpty: 'Yes', ...t }

      t.formats    = Array.isArray(t.formats)  ? t.formats  : []
      t.includes   = Array.isArray(t.includes) ? t.includes : []
      t.excludes   = Array.isArray(t.excludes) ? t.excludes : []

      t.formats    = t.formats.map(t => t.toLowerCase())
      t.includes   = t.includes.map(t => Path.resolve(__dirname, Path.root + t))
      t.excludes   = t.excludes.map(t => Path.resolve(__dirname, Path.root + t))

      t.hidden     = t.hidden.toLowerCase()     === 'yes' ? true : false
      t.recursive  = t.recursive.toLowerCase()  === 'yes' ? true : false
      t.allowEmpty = t.allowEmpty.toLowerCase() === 'yes' ? true : false

      return t
    })
    .filter(t => t !== null)
    .map(dir => mapDir(dir.path, dir))
    .reduce((a, b) => a.concat(b))
  } catch (error) {
    yaml = { error: error }
  }

  return yaml
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
  windowPath: windowPath,
  getYamlFile: getYamlFile,
  load: name => require('./' + name),
  loadWatch: name => require('./watch/' + name),
  loadDeploy: name => require('./deploy/' + name),
  loadZip: name => require('./zip/' + name)
}
