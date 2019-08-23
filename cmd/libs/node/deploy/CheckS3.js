/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display = require('../Display')
const print   = require('../Ginkgo').print
const Xterm   = require('../Xterm')
const Menu    = require('./Menu')
const Argv    = require('./Argv')
const Path    = require('path')
const S3      = require('aws-sdk/clients/s3')

let reInput   = false
let lastCheck = false

const input = (title, d4, allowSpace, closure) => {
  if (reInput === false && d4 !== null)
    return print(' '.repeat(3) + Xterm.color.cyan('➤') + ' ' + title + Xterm.color.gray(d4, true) + Display.LN) && closure(d4)

  lastCheck = true

  const read = require('readline').createInterface
  const line = read({ input: process.stdin, output: process.stdout })

  line.question(' '.repeat(3) + Xterm.color.cyan('➤') + ' ' + title, val => {
    line.close()
    val = val.trim()
    return allowSpace || val.length ? closure && closure(val) : input(title, d4, allowSpace, closure)
  })

  if (d4 !== null)
    line.write(d4)
  else if (title == 'Folder Name：')
    line.write(Path.root.split(Path.sep).map(t => t.trim()).filter(v => v.length).pop())
}

const checkInput = closure => true &&
  Display.title('以上是否正確？') &&
  
  Menu.choice('0', [
    { title: '是的，資訊沒錯', subtitle: 'Yes, the information is correct', value: '1' },
    { title: '不對，我要重寫', subtitle: 'No, the information should be rewritten', value: '2' }
  ], val => val == '2' && (reInput = true) ? info('重新確認 S3 資訊', closure) : testS3(closure))

const testS3 = closure => true &&
  Display.title('測試連線') &&

  Display.line('測試 S3 是否可以正常連線') &&

  (Argv.s3 = new S3({ accessKeyId: Argv.data.access, secretAccessKey: Argv.data.secret }))
    ? Argv.s3.listBuckets(
      (error, data) => !error
        ? data.Buckets.map(t => t.Name ).indexOf(Argv.data.bucket) == -1
          ? Display.line(false, '您這組 ' + Xterm.color.gray('access') + '、' + Xterm.color.gray('secret') + ' 無法操作 ' + Xterm.color.gray(Argv.data.bucket, true) + ' 此 Bucket！')
          : Display.line(true) && closure && closure()
        : Display.line(false, ['相關原因：' + error.message]))
    : Display.line(false, ['初始 S3 物件失敗！', '請確認 S3 連線資訊是否正確！'])

const info = (title, closure) => true &&
  Display.title(title) &&

  input('Bucket Name：', Argv.data.bucket, false, val => {
    Argv.data.bucket = val

    input('Access Key ：', Argv.data.access, false, val => {
      Argv.data.access = val

      input('Secret Key ：', Argv.data.secret, false, val => {
        Argv.data.secret = val
          
        input('Folder Name：', Argv.data.folder, true, val => {
          Argv.data.folder = val

          input('Domain URL ：', Argv.data.domain, false, val => {
            Argv.data.domain = val
            return lastCheck ? checkInput(closure) : testS3(closure)
          })
        })
      })
    })
  })

module.exports = info
