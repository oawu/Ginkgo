/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Init = require('./lib/node/Init')

Init('Ginkgo 部署工具', app => {
  const Config = app.loader('deploy/Config')
  const Dist   = app.loader('build/Dist')
  const Up2S3  = app.loader('deploy/Up2S3')
  const Up2Gh  = app.loader('deploy/Up2Gh')

  Config(app, _ => {
    Dist(app, _ => {
      app.config.argvs['--goal'] == 's3'
        ? Up2S3(app, _ => {
          process.stdout.write("\n" + ' ' + app.color.yellow('【部署完成】') + "\n")
          process.stdout.write("\r" + ' '.repeat(3) + '🎉 太棒惹，已經完成部署囉，趕緊去看最新版的吧！' + "\n")
          process.stdout.write("\r" + ' '.repeat(3) + '❗️ 若有設定 CDN 快取的話，請等 Timeout 後再試。' + "\n")
          process.stdout.write("\r" + ' '.repeat(3) + '⏰ 部署耗費時間' + app.color.gray('：').dim() + app.color.lGray(app.during()) + "\n")
          process.stdout.write("\r\n")
        })
        : Up2Gh(app, _ => {
          console.error('finish Up2Gh');
        })
    })
  })
})
