/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Init = require('./lib/node/Init')

Init('Ginkgo 開發工具', app => {
  app.exit(_ => {
    require('fs').unlinkSync(app.path('lib-scss') + 'config.rb')
    if (!App.config.serve.autoCleanCache) return
    require('fs').rmdirSync(app.path('lib-scss') + '.sass-cache', { recursive: true })
    require('fs').rmdirSync(app.path('cmd') + 'node_modules', { recursive: true })
  })

  const Config = app.loader('serve/Config')
  const Watch  = app.loader('serve/Watch')
  const Server = app.loader('serve/Server')

  Config(app, _ => {
    Watch(app, _ => {
      Server(app, _ => {
        const url = (app.config.serve.server.ssl ? 'https' : 'http') + '://' + app.config.serve.server.domain + ':' + app.config.serve.server.port + '/'
        process.stdout.write("\n" + ' ' + app.color.yellow('【準備開發】') + "\n")
        process.stdout.write("\r" + ' '.repeat(3) + '🎉 Yes! 環境已經就緒惹！' + "\n")
        process.stdout.write("\r" + ' '.repeat(3) + '⏰ 啟動耗費時間' + app.color.gray('：').dim() + app.color.lGray(app.during()) + "\n")
        process.stdout.write("\r" + ' '.repeat(3) + '🌏 開發網址：' + app.color.lBlue(url).italic().underline() + "\n")
        process.stdout.write("\r" + ' '.repeat(3) + '🚀 Go! Go! Go! 趕緊來開發囉！' + "\n")
        process.stdout.write("\n" + ' ' + app.color.yellow('【以下為紀錄】') + "\n")
        app.already(true)
        app.config.serve.autoOpenBrowser && require('open')(url)
      })
    })
  })
})
