/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const timeUnit = require('../Ginkgo').timeUnit
const print    = require('../Ginkgo').print
const Display  = require('../Display')
const Xterm    = require('../Xterm')
const Argv     = require('./Argv')

const goal  = Argv.data.goal === 'aws-s3' ? 'Amazon S3' : 'GitHub Pages'
const url   = Argv.data.goal === 'aws-s3' ? 'https://' + Argv.data.domain + '/' + (Argv.data.folder.length ? Argv.data.folder + '/' : '') + 'index.html' : 'https://' + Argv.githubUris.shift() + '.github.io/' + Argv.githubUris.shift() + '/index.html'
const cache = Argv.data.goal === 'aws-s3' ? '若有設定 CDN 快取的話，請等 Timeout 後再試。' : '因為快取問題，請稍待' + Xterm.color.gray('約 1 分鐘', true) + '後再試。'
const rate  = Argv.minifyRate === null    ? '尚未壓縮' : Argv.minifyRate

module.exports = title => {
  
  Display.title(title)
  
  if (process.platform === 'win32') {
    print(' '.repeat(3) + Xterm.color.cyan('＊') + ' 太棒惹，已經完成部署囉，趕緊去看最新版的吧！' + Display.LN)
    print(' '.repeat(3) + Xterm.color.cyan('＊') + ' ' + cache + Display.LN)
    print(' '.repeat(3) + Xterm.color.cyan('＊') + ' 部署的平台是' + Display.markSemicolon() + goal                   + Display.LN)
    print(' '.repeat(3) + Xterm.color.cyan('＊') + ' 部署耗費時間' + Display.markSemicolon() + timeUnit(Argv.startAt) + Display.LN)
    print(' '.repeat(3) + Xterm.color.cyan('＊') + ' 靜態檔壓縮率' + Display.markSemicolon() + Argv.minifyRate        + Display.LN)
    print(' '.repeat(3) + Xterm.color.cyan('＊') + ' 這是您的網址' + Display.markSemicolon() + url                    + Display.LN)
      
  } else {
    print(' '.repeat(3) + '🎉 太棒惹，已經完成部署囉，趕緊去看最新版的吧！' + Display.LN)
    print(' '.repeat(3) + '❗️ ' + cache + Display.LN)
    print(' '.repeat(3) + '🚀 部署的平台是' + Display.markSemicolon() + Xterm.color.gray(goal, true)                   + Display.LN)
    print(' '.repeat(3) + '⏰ 部署耗費時間' + Display.markSemicolon() + Xterm.color.gray(timeUnit(Argv.startAt), true) + Display.LN)
    print(' '.repeat(3) + '📦 靜態檔壓縮率' + Display.markSemicolon() + Xterm.color.gray(Argv.minifyRate, true)        + Display.LN)
    print(' '.repeat(3) + '🌏 這是您的網址' + Display.markSemicolon() + Xterm.color.blue(url, true).underline()        + Display.LN)
  }

  print(Display.LN + Display.LN)
}