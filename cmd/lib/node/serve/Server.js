/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const URL = require('url')
const Mime = require('mime')
const FileSystem = require('fs')
const Exec = require('child_process').exec

let App      = null
let Color    = null
let Path     = null
let Sep      = null
let Progress = null
let readied  = false
let showLog  = false

const portStatus = (port, closure) => {
  const net = require('net').createServer()

  return net.once('error',
    error => error.code != 'EADDRINUSE'
      ? closure(false, error)
      : closure(false))

    .once('listening',
      () => net.once('close',
        () => closure(true, null)).close())
    .listen(port)
}

const scanPort = (min, max, closure) => {
  if (App.config.serve.server.port.default == min)
    return scanPort(min + 1, max, closure)

  Progress.doing('檢查 Server port ' + Color.lGray(min), Progress.cmd('執行動作', 'listening ' + min))
  Progress.total(1)
  
  min > max
    ? Progress.failure(null, min + ' ~ ' + max + ' 的 port 皆已被使用中！')
    : portStatus(min, (free, error) => {
      Progress.doing() && !free
        ? max > min
          ? Progress.failure('已被使用') && scanPort(min + 1, max, closure)
          : Progress.failure('已被使用', min + ' ~ ' + max + ' 的 port 皆已被使用中！')
        : Progress.success() && closure(min)})
}

const resError = (params, message) => {
  const contents = []
  contents.push('<!DOCTYPE html>')
  contents.push('<html lang="zh-Hant">')
  contents.push('<head>')
  contents.push('<meta http-equiv="Content-Language" content="zh-tw">')
  contents.push('<meta http-equiv="Content-type" content="text/html; charset=utf-8">')
  contents.push('<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">')
  contents.push('<meta name="robots" content="noindex,nofollow,noarchive">')
  contents.push('<meta name="googlebot" content="noindex,nofollow,noarchive">')
  contents.push('<title>404 Not Found | Ginkgo 5</title>')
  contents.push('<link href="https://fonts.googleapis.com/css?family=Comfortaa:400,300,700" rel="stylesheet" type="text/css">')
  contents.push('<link href="https://cdn.jsdelivr.net/npm/hack-font@3.3.0/build/web/hack.css" rel="stylesheet">')
  contents.push('<style type="text/css">*, *:after, *:before { vertical-align: top; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; -moz-osx-font-smoothing: subpixel-antialiased; -webkit-font-smoothing: subpixel-antialiased; -moz-font-smoothing: subpixel-antialiased; -ms-font-smoothing: subpixel-antialiased; -o-font-smoothing: subpixel-antialiased; }html { padding: 0; }body { margin: 0; text-align: center; background-color: #373832; }body, h1, h1:before, p, article, article:before, div, div:before, svg, a, a:after, i, section, footer { display: inline-block; }a, i { float: left; }html, body, article, div, a { position: relative; }article:before, div:before, a:after { position: absolute; }article:before, div:before { left: 0; top: 0; }body, h1, article:before, div, footer, p { width: 100%; }h1 { margin-top: 32px; color: #d7d7d7; font-size: 56px; font-family: Comfortaa; height: 72px; line-height: 72px; text-shadow: 1px 1px 10px rgba(0, 0, 0, 0.5); }h1:after { color: #e6e6e6; font-size: 64px; margin-left: 6px; }h1[v7]:after { content: "7"; }p { color: white; margin: 0; margin-top: -30px; color: #7f7f7f; }p + p { margin-top: 4px; }p + footer { margin-top: 52px; }article { width: calc(100% - 16px); max-width: 500px; text-align: left; padding: 12px 8px; padding-left: 0; margin: 0 8px; margin-top: 20px; background-color: #282923; overflow: hidden; overflow-x: auto; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; -moz-box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.3), 1px 1px 1px rgba(255, 255, 255, 0.075); -webkit-box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.3), 1px 1px 1px rgba(255, 255, 255, 0.075); box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.3), 1px 1px 1px rgba(255, 255, 255, 0.075); }article:before { content: ""; height: 100%; width: 36px; background-color: #282923; -moz-box-shadow: 0 0 5px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.2); -webkit-box-shadow: 0 0 5px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.2); box-shadow: 0 0 5px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.2); }div { width: 420px; height: 22px; line-height: 22px; padding: 0 16px; padding-left: 48px; color: #f8f8f2; font-family: Hack, Comfortaa; }div:before { width: 36px; color: #90918b; font-size: 13px; font-weight: 100; text-align: center; }div:nth-child(1):before { content: "01"; }div:nth-child(2):before { content: "02"; }div:nth-child(3):before { content: "03"; }div:nth-child(4):before { content: "04"; }div:nth-child(5):before { content: "05"; }div:nth-child(6):before { content: "06"; }div:nth-child(7):before { content: "07"; }div:nth-child(8):before { content: "08"; }div:nth-child(9):before { content: "09"; }div:nth-child(10):before { content: "10"; }div:nth-child(11):before { content: "11"; }div:nth-child(12):before { content: "12"; }div:nth-child(13):before { content: "13"; }div:nth-child(14):before { content: "14"; }.purple { color: #b07dff; }.blue { color: #61d8f1; }.yellow { color: #d3c964; }.red { color: #ee1b6b; }.space { padding-left: 16px; }svg { width: 14px; height: 14px; fill: white; margin-right: 2px; margin-top: 2px; fill: #696a65; -moz-transition: fill 0.3s; -o-transition: fill 0.3s; -webkit-transition: fill 0.3s; transition: fill 0.3s; }a { text-decoration: none; color: #7e807c; -moz-transition: color 0.3s; -o-transition: color 0.3s; -webkit-transition: color 0.3s; transition: color 0.3s; font-family: Comfortaa; font-size: 13px; }a:hover { color: #9c9d9c; }a:hover svg { fill: rgba(156, 157, 156, 0.75); }a:after { left: -11px; top: calc(50% - 12px/2); width: 1px; height: 12px; border-left: 1px solid rgba(255, 255, 255, 0.1); }a + a { margin-left: 21px; }a + a:after { content: ""; }section { height: 20px; line-height: 20px; *zoom: 1; }section:after { display: table; content: ""; line-height: 0; clear: both; }footer { margin-top: 16px; }</style>')
  contents.push('</head>')
  contents.push('<body>')
  
  if (message) {
    contents.push('<h1>GG . 惹</h1>')
    contents.push('<p style="font-size: 20px;">糟糕，' + message + '</p>')
  } else {
    contents.push('<h1>肆 . 零 . 肆</h1>')
    contents.push('<p>糟糕，是 404 not found！</p>')
    contents.push('<article>')
    contents.push('<div><span class="red">html</span> {</div>')
    contents.push('<div><span class="blue space">position</span>: <span class="blue">fixed</span>;</div>')
    contents.push('<div><span class="blue space">top</span>: <span class="purple">-99999</span><span class="red">px</span>;</div>')
    contents.push('<div><span class="blue space">left</span>: <span class="purple">-99999</span><span class="red">px</span>;</div>')
    contents.push('<div></div>')
    contents.push('<div><span class="blue space">z-index</span>: <span class="purple">-99999</span>;</div>')
    contents.push('<div></div>')
    contents.push('<div><span class="blue space">display</span>: <span class="blue">none</span>;</div>')
    contents.push('<div><span class="blue space">width</span>: <span class="purple">0</span>;</div>')
    contents.push('<div><span class="blue space">height</span>: <span class="purple">0</span>;</div>')
    contents.push('<div></div>')
    contents.push('<div><span class="red space">@include</span> <span class="blue">opacity</span>(<span class="purple">0</span>);</div>')
    contents.push('<div><span class="red space">@include</span> <span class="blue">scale</span>(<span class="purple">0</span>);</div>')
    contents.push('<div>}</div>')
    contents.push('</article>')
  }

  contents.push('<footer>')
  contents.push('<section>')
  contents.push('<a href="/"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><path d="M512 0c-282.77 0-512 229.23-512 512s229.23 512 512 512 512-229.23 512-512-229.23-512-512-512zM512 960.002c-62.958 0-122.872-13.012-177.23-36.452l233.148-262.29c5.206-5.858 8.082-13.422 8.082-21.26v-96c0-17.674-14.326-32-32-32-112.99 0-232.204-117.462-233.374-118.626-6-6.002-14.14-9.374-22.626-9.374h-128c-17.672 0-32 14.328-32 32v192c0 12.122 6.848 23.202 17.69 28.622l110.31 55.156v187.886c-116.052-80.956-192-215.432-192-367.664 0-68.714 15.49-133.806 43.138-192h116.862c8.488 0 16.626-3.372 22.628-9.372l128-128c6-6.002 9.372-14.14 9.372-22.628v-77.412c40.562-12.074 83.518-18.588 128-18.588 70.406 0 137.004 16.26 196.282 45.2-4.144 3.502-8.176 7.164-12.046 11.036-36.266 36.264-56.236 84.478-56.236 135.764s19.97 99.5 56.236 135.764c36.434 36.432 85.218 56.264 135.634 56.26 3.166 0 6.342-0.080 9.518-0.236 13.814 51.802 38.752 186.656-8.404 372.334-0.444 1.744-0.696 3.488-0.842 5.224-81.324 83.080-194.7 134.656-320.142 134.656z"></path></svg>回首頁</a>')
  contents.push('<a href="https://github.com/comdan66/Ginkgo" target="_blank"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M256.004 6.321c-141.369 0-256.004 114.609-256.004 255.999 0 113.107 73.352 209.066 175.068 242.918 12.793 2.369 17.496-5.555 17.496-12.316 0-6.102-0.24-26.271-0.348-47.662-71.224 15.488-86.252-30.205-86.252-30.205-11.641-29.588-28.424-37.458-28.424-37.458-23.226-15.889 1.755-15.562 1.755-15.562 25.7 1.805 39.238 26.383 39.238 26.383 22.836 39.135 59.888 27.82 74.502 21.279 2.294-16.543 8.926-27.84 16.253-34.232-56.865-6.471-116.638-28.425-116.638-126.516 0-27.949 10.002-50.787 26.38-68.714-2.658-6.45-11.427-32.486 2.476-67.75 0 0 21.503-6.876 70.42 26.245 20.418-5.674 42.318-8.518 64.077-8.617 21.751 0.099 43.668 2.943 64.128 8.617 48.867-33.122 70.328-26.245 70.328-26.245 13.936 35.264 5.175 61.3 2.518 67.75 16.41 17.928 26.347 40.766 26.347 68.714 0 98.327-59.889 119.975-116.895 126.312 9.182 7.945 17.362 23.523 17.362 47.406 0 34.254-0.298 61.822-0.298 70.254 0 6.814 4.611 14.797 17.586 12.283 101.661-33.888 174.921-129.813 174.921-242.884 0-141.39-114.617-255.999-255.996-255.999z"></path></svg>GitHub</a>')
  contents.push('</section>')
  contents.push('</footer>')
  contents.push('</body>')
  contents.push('</html>')
  
  const { method, pathname, response } = params
  message = message ? 500 : 404

  response.writeHead(message, { 'Content-Type': 'text/html; charset=UTF-8' })
  response.write(contents.join(''))
  response.end()
  showLog && Progress.doing('接收 ' + Color.lGray(method + '：' + pathname) + ' 請求', Progress.cmd('Request', method + ' ' + pathname)).total(1).success('回應：' + message)
}

const addReloadAction = data => {
  return data = data.split('</head>').filter(t => t.length), readied && data.length
  ? [ data.shift(),
      '<script src="/socket.io/socket.io.js"></script>',
      '<script type="text/javascript">',
        'io && io.connect().on("reload", function(data) { location.reload(data); });',
      '</script>',
      '</head>',
      data.join('</head>'),
    ].join('')
  : data.join('</head>')
}

const resDocu = params => {
  const { type, response, method, extension, pathname, gets, row } = params
  const file = App.path('entry') + pathname.replace(/\//gm, Sep)
  
  if (!FileSystem.existsSync(file))
    return resError(params)

  if (extension == 'php') {
    const cmds = []
    cmds.push('php', App.path('lib-php-main'))
    cmds.push('--path', file)
    cmds.push('--env', App.config.argvs['--env'])
    cmds.push('--base-url', App.config.argvs['--base-url'])
    // gets !== null && cmds.push('--gets', JSON.stringify(gets))
    // row !== null  && cmds.push('--row', row)

    return Exec(cmds.join(' '), { maxBuffer: App.config.enablePHP.maxBuffer }, (error, stdout) => {
      error = error ? 400 : 200

      cmds[1] = Path.relative(App.path('root'), cmds[1])
      cmds[3] = Path.relative(App.path('root'), cmds[3])

      const details = []
      for (let i = 0, l = Math.ceil(cmds.length / 2); i < l; i++)
        i ? details.push(' '.repeat(4) + Color.lGray(cmds[i * 2]).dim() + ' ' + Color.lGray(cmds[(i * 2) + 1]).dim().italic())
          : details.push(Color.lGray(cmds[i * 2]).dim() + ' ' + Color.lGray(cmds[i * 2 + 1]).dim().italic())

      response.writeHead(error, { 'Content-Type': 'text/html; charset=UTF-8' })
      response.write(addReloadAction(stdout))
      response.end()
      
      showLog && Progress.doing('接收 ' + Color.lGray(method + '：' + pathname) + ' 請求', Progress.cmd('Request', method + ' ' + pathname), ...details).total(1).success('回應：' + error)
    })
  }

  FileSystem.readFile(file, { encoding: extension && App.config.serve.server.utf8Exts.indexOf('.' + extension) != -1 ? 'utf8' : null}, (error, data) => {
    if (error) return resError(params, '讀取檔案 ' + Path.relative(App.path('entry'), file) + ' 發生錯誤！')
    response.writeHead(200, { 'Content-Type': Mime.getType(file) + '; charset=UTF-8' })
    response.write(addReloadAction(data))
    response.end()
    showLog && Progress.doing('接收 ' + Color.lGray(method + '：' + pathname) + ' 請求', Progress.cmd('Request', method + ' ' + pathname)).total(1).success('回應：200')
  })
}

const resFile = params => {
  const { pathname, method, extension, response } = params
  const file = App.path('entry') + pathname.replace(/\//gm, Sep)
  return FileSystem.existsSync(file)
    ? FileSystem.readFile(file, { encoding: extension && App.config.serve.server.utf8Exts.indexOf('.' + extension) != -1 ? 'utf8' : null}, (error, data) => {
      if (error) return resError(params, '讀取檔案 ' + Path.relative(App.path('entry'), file) + ' 發生錯誤！')
      response.writeHead(200, { 'Content-Type': Mime.getType(file) + '; charset=UTF-8' })
      response.write(data)
      response.end()
      showLog && Progress.doing('接收 ' + Color.lGray(method + '：' + pathname) + ' 請求', Progress.cmd('Request', method + ' ' + pathname)).total(1).success('回應：200')
    })
    : resError(params)
}

const getGET = query => {
  query = query === null ? [] : query.split('&').filter(t => t !== '').map(t => t.split('=')).filter(t => t.length > 1).map(t => [t.shift(), t.join('=')])
  if (!query.length) return null

  let gets = {}
  for (let i in query)
    gets[query[i].shift()] = query[i].shift()
  return gets
}

const serverRequest = (type, request, response) => {
  const param = []
  request.on('data', chunk => param.push(chunk))
  request.on('end', _ => {
    const url       = URL.parse(request.url)
    const method    = request.method.toUpperCase()
    const pathname  = url.pathname.replace(/\/+/gm, '/').replace(/\/$|^\//gm, '').replace(/^\s*$/gm, 'index')
    const extension = Mime.getExtension(Mime.getType(pathname))
    const gets      = getGET(url.query)
    const row       = param.length ? Buffer.concat(param).toString() : null
    const params    = { type, request, response, url, method, pathname, extension: extension ? extension.toLowerCase() : extension, gets, row }

    return params.extension === null || (!App.config.enablePHP || params.extension == 'php') || params.extension == 'html'
      ? resDocu({ ...params, pathname: pathname + (params.extension === null ? App.config.enablePHP ? '.php' : '.html' : ''), extension: params.extension === null ? App.config.enablePHP ? 'php' : 'html' : params.extension })
      : resFile(params)
  })
}

const openWebSocketServer = (server, closure) => {
  Progress.doing('開啟 ' + Color.yellow('WebSocket') + ' 伺服器', Progress.cmd('執行動作', 'run WebSocket Server')), Progress.total(1)

  const sockets = new Map()
  try {
    App.socketIO = require('socket.io').listen(server)
    App.socketIO.sockets.on('connection', socket => {
      sockets.set(socket, 1)
      socket.on('disconnect', _ => {
        sockets.delete(socket)
        showLog && Progress.doing('失去 Socket 連線', Progress.cmd('Socket', 'disconnect'), Color.lGray('目前共有 ').dim() + Color.lGray(sockets.size) + Color.lGray(' 個連線').dim()) && Progress.total(1) && Progress.success()
      })
      showLog && Progress.doing('新增 Socket 連線', Progress.cmd('Socket', 'connection'), Color.lGray('目前共有 ').dim() + Color.lGray(sockets.size) + Color.lGray(' 個連線').dim()) && Progress.total(1) && Progress.success()
    })
    Progress.success(), closure()
  } catch (e) {
    return Progress.failure('失敗'),
      process.stdout.write("\r" + ' '.repeat(5) + Color.purple('↳').dim() + ' 錯誤原因：' + Color.lGray(e.message) + "\n"),
      process.stdout.write("\r" + ' '.repeat(5) + Color.purple('↳').dim() + ' 無法使用 ' + Color.red('LiveReload') + " 功能\n"),
      process.stdout.write("\r" + ' '.repeat(5) + Color.purple('↳').dim() + ' 其他功能 ' + Color.green('ICON') + Color.lGray('、').dim() + Color.green('SCSS') + " 皆能正常使用\n"),
      closure()
  }
}

const openHttpsServer = closure => {
  Progress.doing('開啟 ' + Color.lCyan('https') + ' 伺服器', Progress.cmd('執行動作', 'run https Server, port:' + App.config.serve.server.port)), Progress.total(1)
  try {
    
    const https = require('https').Server(App.config.serve.server.ssl)
    Progress.do()
    https.on('error', e => Progress.doing(Color.lCyan('https') + ' 發生錯誤', Progress.cmd('錯誤原因', e.message)) && Progress.failure())
    https.listen(App.config.serve.server.port, _ => {
      Progress.success()
      App.config.argvs['--base-url'] = App.config.argvs['--base-url'] === undefined ? 'https' + '://' + App.config.serve.server.domain + ':' + App.config.serve.server.port + '/' : App.config.argvs['--base-url']
      openWebSocketServer(https, closure)
    })
    https.on('request', serverRequest.bind(null, 'https'))
  } catch (e) {
    return Progress.failure('失敗'), process.stdout.write("\r" + ' '.repeat(5) + Color.purple('↳').dim() + ' ' + e.message + "\n"), openHttpServer(closure)
  }
}

const openHttpServer = closure => {
  Progress.doing('開啟 ' + Color.lPurple('http') + ' 伺服器', Progress.cmd('執行動作', 'run http Server, port:' + App.config.serve.server.port)), Progress.total(1)
  try {
    const http = require('http').Server()
    Progress.do()
    http.on('error', e => Progress.doing(Color.lPurple('http') + ' 發生錯誤', Progress.cmd('錯誤原因', e.message)) && Progress.failure())
    http.listen(App.config.serve.server.port, _ => {
      Progress.success()
      App.config.argvs['--base-url'] = App.config.argvs['--base-url'] === undefined ? 'http' + '://' + App.config.serve.server.domain + ':' + App.config.serve.server.port + '/' : App.config.argvs['--base-url']
      openWebSocketServer(http, closure)
    })
    http.on('request', serverRequest.bind(null, 'http'))
  } catch (e) {
    return Progress.failure('失敗', e)
  }
}

module.exports = (app, closure) => {
  App = app, Color = app.color, Path = App.path('$'), Sep = Path.sep, Progress = App.progress

  process.stdout.write("\n" + ' ' + Color.yellow('【啟動開發伺服器】') + "\n")

  const server = port => {
    App.config.serve.server.port = port
    App.config.serve.server.ssl ? openHttpsServer(closure) : openHttpServer(closure)
  }

  app.onReady(status => readied = status)

  if (!isNaN(App.config.serve.server.port))
    return Progress.doing('檢查 Server port ' + Color.lGray(App.config.serve.server.port), Progress.cmd('執行動作', 'listening ' + App.config.serve.server.port)), Progress.total(1), portStatus(App.config.serve.server.port, (free, error) => Progress.doing() && free
      ? Progress.success() && server(App.config.serve.server.port)
      : Progress.failure('已被使用', 'port ' + Color.lGray(App.config.serve.server.port) + ' 已被使用中！'))

  Progress.doing('檢查 Server port ' + Color.lGray(App.config.serve.server.port.default), Progress.cmd('執行動作', 'listening ' + App.config.serve.server.port.default)), Progress.total(1)

  portStatus(App.config.serve.server.port.default, (free, error) => Progress.doing() && free
    ? Progress.success() && server(App.config.serve.server.port.default)
    : Progress.failure('已被使用') && scanPort(App.config.serve.server.port.min, App.config.serve.server.port.max, server))
}
