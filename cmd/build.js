/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2020, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Init = require('./lib/node/Init')

Init('Ginkgo 編譯工具', app => {
  const Config = app.loader('build/Config')
  const Dist = app.loader('build/Dist')

  Config(app, _ => {
    Dist(app, _ => {
      process.stdout.write("\n" + ' ' + app.color.yellow('【編譯完成】') + "\n")
      process.stdout.write("\r" + ' '.repeat(3) + '🎉 太棒惹，已經完成編譯囉，趕緊去看最新版的吧！' + "\n")
      process.stdout.write("\r" + ' '.repeat(3) + '❗️ 若有設定 CDN 快取的話，請等 Timeout 後再試。' + "\n")
      process.stdout.write("\r" + ' '.repeat(3) + '⏰ 編譯耗費時間' + app.color.gray('：').dim() + app.color.lGray(app.during()) + "\n")
      process.stdout.write("\r" + ' '.repeat(3) + '🚀 編譯完後的目錄在專案下的 ' + app.color.lGray(app.path('$').relative(app.path('root'), app.path('dest')) + app.path('$').sep) + "\n")
      process.stdout.write("\r\n")
      app.config.build.autoOpenFolder && require('open')(app.path('dest'))
    })
  })
})
