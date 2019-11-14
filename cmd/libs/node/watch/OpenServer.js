/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const print      = require('../Ginkgo').print
const Bus        = require('../Ginkgo').bus
const Display    = require('../Display')
const Xterm      = require('../Xterm')
const CmdExists  = require('command-exists').sync
const Exec       = require('child_process').exec
const FileSystem = require('fs')
const Http       = require('http')
const Path       = require('path')
const Mime       = require('mime')

const minPort = 8000
const maxPort = 8999

let ready = false

let Socket = {
  connections: [],
  reload: () => Socket.connections.forEach(t => t.emit('action', 'reload'))
}

const html404 = message => {
  ready && Display.line('伺服器錯誤', message) && Display.line(false)

  try {
    return FileSystem.readFileSync(Path.cmd + 'libs' + Path.sep + 'node' + Path.sep + 'watch' + Path.sep + '404.html', 'utf8')
  } catch(e) {
    return '404 Not Found'
  }
}

const addSocket = data => {
  var tokens = data.split('</head>').filter(t => t.length)
  if (!tokens.length) return data
  
  var tmps = [tokens.shift()]
  tokens = tokens.join('</head>')

  tmps.push('<script src="/socket.io/socket.io.js"></script><script type="text/javascript">var socket = io.connect();socket.on("action", function(data) { if (data === "reload") location.reload(true); });</script>')
  tmps.push('</head>')
  tmps.push(tokens)
  return tmps.join('')
}

const openServer = (closure, port) => {
  Display.lines('開啟伺服器',
    ['主要語法', 'run http.createServer:' + port])

  let server = Http.createServer((request, response) => {
    let path = require('url').parse(request.url).pathname
    
    if (path === '/')
      path = Path.sep + 'index.html'

    var pattern = new RegExp('^' + Path.sep + '+', 'gm')
    path = path.replace(/\/+/gm, Path.sep).replace(pattern, '')

    if (path[path.length - 1] == Path.sep) {
      path += 'index.html'
    }

    path = Path.root + path

    if (!FileSystem.existsSync(path)) {
      response.writeHead(404, {'Content-Type': 'text/html; charset=UTF-8'})
      response.write(html404('找不到檔案：' + Xterm.color.gray(path, true).dim().italic()))
      response.end()
      return
    }

    let ext = Mime.getExtension(Mime.getType(path))
    if (ext === 'php' && CmdExists('php'))
      return Exec('php ' + path, (error, stdout, stderr) => {
        response.writeHead(error ? 400 : 200, {'Content-Type': 'text/html; charset=UTF-8'})
        response.write(addSocket(stdout))
        response.end()
        return;
      })

    FileSystem.readFile(path, (error, data) => {
      if (error) {
        response.writeHead(404, {'Content-Type': 'text/html; charset=UTF-8'})
        response.write(html404('錯誤原因：' + Xterm.color.gray(error, true).dim().italic()))
      } else {
        response.writeHead(200, {'Content-Type': Mime.getType(path) + '; charset=UTF-8'})
        response.write(ext == 'html' ? addSocket(data.toString('utf8')) : data)
      }
      response.end()
    })

  })
  .listen(port)
  .on('error', error => Display.line(false, ['請檢查是否有其他的服務使用了 ' + minPort + ' ~ ' + maxPort + ' 的 Port！', error.message]))

  const socketIO = require('socket.io').listen(server)

  Display.line(true, '完成')
  
  if (process.platform === 'win32')
    print(' '.repeat(5) + Display.markHash() + ' ' + '網址' + Display.markSemicolon() + 'http://127.0.0.1:' + port + '/' + Display.LN)
  else
    print(' '.repeat(5) + Display.markHash() + ' ' + Xterm.color.gray('網址', true).dim() + Display.markSemicolon() + Xterm.color.blue('http://127.0.0.1:' + port + '/', true).italic().underline() + Display.LN)

  socketIO.sockets.on('connection',
    socket => true &&
      Socket.connections.push(socket) &&
      socket.on('disconnect', () => {
        const index = Socket.connections.indexOf(socket)
        index === -1 || Socket.connections.splice(index, 1)
      }))

  return Bus.on('ready', status => ready = status) && closure(Socket.reload)
}

const isPortUsed = (port, closure) => {
  const net = require('net').createServer()
  return net.once('error',
    error => error.code != 'EADDRINUSE'
      ? closure(error)
      : closure(null, true))
    .once('listening',
      () => net.once('close',
        () => closure(null, false)).close())
    .listen(port)
}

const testPort = (start, end, success, failure) => start > end
  ? failure && failure()
  : Display.lines('檢查 Server Port',
      ['執行動作', 'listening ' + start]) &&
    isPortUsed(start,
      (error, isUsed) => error !== null || isUsed
        ? Display.line(false) || (error !== null
            ? failure && failure()
            : testPort(start + 1, end, success, failure))
        : Display.line(true) && success && success(start))

module.exports = (title, closure) => true &&
  Display.title(title) &&

  testPort(minPort, maxPort, openServer.bind(null, closure),
    () => true &&
      print(' '.repeat(3) + Display.markList() + ' ' + '開發伺服器開啟失敗，但您依然可以開發！') &&
      print(Display.LN) &&
      print(' '.repeat(5) + Display.markHash() + ' ' + Xterm.color.gray('您的 Port', true).dim() + ' ' + Xterm.color.gray(minPort, true) + ' ' + Xterm.color.gray('~', true).dim() + ' ' + Xterm.color.gray(maxPort, true) + ' ' + Xterm.color.gray('都被使用中', true).dim() + Display.LN) &&
      closure(null))
