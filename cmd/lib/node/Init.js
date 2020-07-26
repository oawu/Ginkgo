/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path = require('path')

const paths = {
  $: Path,
  root: Path.resolve(__dirname, ('..' + Path.sep).repeat(3)) + Path.sep,
}

const Queue = function(...closures) {
if (!(this instanceof Queue)) return new Queue(...closures)
  this.closures = []
  this.isWork = false
  closures.forEach(this.enqueue.bind(this))
}
Queue.prototype.size = function() { return this.closures.length }
Queue.prototype.enqueue = function(closure) { return this.closures.push(closure), this.dequeue(this.prev), this }
Queue.prototype.dequeue = function(prev) {
  if (this.isWork) return this;
  else this.isWork = true

  return this.closures.length
    ? this.closures[0](prev => {
        this.closures.shift()
        this.isWork = false
        this.dequeue(this.prev = prev)
      }, prev)
    : (this.isWork = false), this
}

const app = {
  config: null,
  color: null,
  progress: null,
  readies: [],
  exits: [],
  socketIO: null,
  startAt: new Date().getTime(),
  queue: Queue,
  exit (closure) { return this.exits.push(closure), this },
  onReady (closure) { return this.readies.push(closure), this },
  already (status) { return this.readies.forEach(ready => ready(status)), this },
  loader (lib) { return require(this.path('lib-node') + lib) },
  during () {
    const units = []
    const contitions = [{ base: 60, format: '秒' }, { base: 60, format: '分鐘' }, { base: 24, format: '小時' }, { base: 30, format: '天' }, { base: 12, format: '個月' }]
    let now = parseInt((new Date().getTime() - this.startAt) / 1000, 10)
    if (now === 0) return '太快了…'
    for (var i in contitions) {
      let nowUnit = now % contitions[i].base
      nowUnit == 0 || units.push(nowUnit + contitions[i].format)
      now = Math.floor(now / contitions[i].base)
      if (now < 1) break
    }
    now > 0 && units.push(now + ' 年')
    units.length < 1 && units.push(now + ' 秒')
    return units.reverse().join(' ')
  },
  path (name, path) {
    return path !== undefined
      ? (paths[name] = paths.root + (Array.isArray(path) ? path.join(Path.sep) : path), this)
      : paths[name]
  }
}


module.exports = (title, closure) => {
  
  process.on('SIGINT', _ => {
    app.exits.forEach(exit => { try { exit() } catch {} })
    process.exit(0)
  })

  app.path('cmd', ['cmd', ''])
  app.path('lib', ['cmd', 'lib', ''])
  app.path('cfg', ['cmd', 'cfg', ''])
  app.path('cfg-ssl', ['cmd', 'cfg', 'ssl', ''])
  app.path('cfg-main', ['cmd', 'cfg', 'Main.js'])

  app.path('lib-node', ['cmd', 'lib', 'node', ''])
  app.path('lib-scss', ['cmd', 'lib', 'scss', ''])
  app.path('lib-php', ['cmd', 'lib', 'php', ''])
  app.path('lib-php-main', ['cmd', 'lib', 'php', 'Main.php'])

  const Xterm = app.loader('Xterm')
  const Progress = app.loader('Progress')
  Progress.color = Xterm.color

  app.color = Xterm.color
  app.progress = Progress

  process.stdout.write('\x1b[2J')
  process.stdout.write('\x1b[0f')
  process.stdout.write("\n" + ' ' + Xterm.color.gray('§').dim() + ' ' + Xterm.color.lGray(title) + "\n")

  const Env = app.loader('Env')
  
  return Env(app, _ => closure(app))
}
