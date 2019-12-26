/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path    = require('path')
const Exec    = require('child_process').execSync
const Display = require('../Display')
const Xterm   = require('../Xterm')
const FileSystem  = require('fs')
  const Exists    = FileSystem.existsSync
  const FileWrite = FileSystem.writeFileSync

const checkConfig = _ => {
  const errors = []
  const Config = require(Path.config)

  Config.dir = Config.dir || {}
  Config.dir.dest = Config.dir.dest || 'dest'

  Config.s3 = Config.s3 || {}
  Config.s3.object = Config.s3.object || null
  Config.s3.domain = Config.s3.domain || null
  Config.s3.bucket = Config.s3.bucket || null
  Config.s3.access = Config.s3.access || null
  Config.s3.secret = Config.s3.secret || null
  Config.s3.prefix = (Config.s3.prefix || '').trim('/')

  Config.s3.domain   || errors.push('尚未設定 S3 Domain')
  Config.s3.bucket   || errors.push('尚未設定 S3 Bucket')
  Config.s3.access   || errors.push('尚未設定 S3 Access Key')
  Config.s3.secret   || errors.push('尚未設定 S3 Secret Key')

  Config.startAt = new Date().getTime()
  
  Path.dest = Path.root + Config.dir.dest.trim(Path.sep) + Path.sep
  delete Config.dir.dest
  
  return errors
}

const getEnv = argvs => {
  for(let i = 0; i < argvs.length; i++)
    if (['-e', '--env'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-' && ['Development', 'Testing', 'Staging', 'Production'].indexOf(argvs[i + 1]) !== -1)
        return argvs[i + 1]
  return null
}

const removeDistGit = _ => {
  try { Exec('cd ' + Path.dest + ' && rm -rf ' + Path.dest + '.git', { stdio: 'pipe' }).toString() }
  catch(e) { return false }
  return true
}

const getConfig = _ => {
  let content = ''
  content += "/**" + Display.LN
  content += " * @author      OA Wu <comdan66@gmail.com>" + Display.LN
  content += " * @copyright   Copyright (c) 2015 - 2019, Ginkgo" + Display.LN
  content += " * @license     http://opensource.org/licenses/MIT  MIT License" + Display.LN
  content += " * @link        https://www.ioa.tw/" + Display.LN
  content += " */" + Display.LN
  content += "" + Display.LN
  content += "module.exports = {" + Display.LN
  content += "  dir: {" + Display.LN
  content += "    dest: 'dist'" + Display.LN
  content += "  }," + Display.LN
  content += "  s3: {" + Display.LN
  content += "    domain: null," + Display.LN
  content += "    bucket: null," + Display.LN
  content += "    access: null," + Display.LN
  content += "    secret: null," + Display.LN
  content += "    prefix: null," + Display.LN
  content += "  }" + Display.LN
  content += "}" + Display.LN
  try { FileWrite(Path.config, content, 'utf8') }
  catch (e) { return false }
  return true
}

module.exports = closure => {
  Display.title('檢查部署環境')

  Display.lines('取得部署設定檔', '執行動作', 'read config/deploy.s3.js file')
  !Exists(Path.config)
    ? Display.line(false) || Display.lines('建立部署設定檔', '執行動作', 'write config/deploy.s3.js file') && getConfig()
      ? Display.line(true)
      : Display.line(false, '建立部署設定檔失敗！')
    : Display.line(true)

  Display.lines('檢查部署設定檔', '執行動作', 'check config/deploy.s3.js file')
  const error = checkConfig()
  error.length
    ? Display.line(false, ['確認設定檔失敗！'].concat(error))
    : Display.line(true)

  Display.lines('檢查部署目錄是否存在', '執行動作', 'check ' + Path.relative(Path.root, Path.dest) + Path.sep + ' is exists')
  Exists(Path.dest)
    ? Display.line(true, '存在')
    : Display.line(false, '部署目錄不存在！')

  Display.lines('檢查部署目錄是否有 .git 檔案', '執行動作', 'check ' + Path.relative(Path.root, Path.dest) + Path.sep + '.git is exists')
  Exists(Path.dest + '.git')
    ? Display.line(false)
    : Display.line(true, '不存在')

  Display.lines('移除部署目錄內的 .git 目錄', '執行動作', 'remove ' + Path.relative(Path.root, Path.dest) + Path.sep + '.git')
  removeDistGit()
    ? Display.line(true)
    : Display.line(false, '移除部署目錄內的 .git 目錄失敗！')

  Display.lines('初始 S3 物件', '執行動作', 'new S3 Object')
  const Config = require(Path.config).s3
  const S3 = require('aws-sdk/clients/s3')
  Config.object = new S3({
    accessKeyId: Config.access,
    secretAccessKey: Config.secret })
  Config.object
    ? Display.line(true)
    : Display.line(false, ['初始 S3 物件失敗！', '請確認 S3 連線資訊是否正確！'])

  Display.lines('檢查 S3 是否可以正常連線', '執行動作', 'test S3 connect')
  Config.object.listBuckets((error, data) => {
    if (error) Display.line(false, '相關原因：' + error.message)
    else Display.line(true)

    Display.lines('檢查是否有此 bucket 權限', '執行動作', 'check bucket in buckets')
    data.Buckets.map(t => t.Name).indexOf(Config.bucket) == -1
      ? Display.line(false, '您這組 ' + Xterm.color.gray('access') + '、' + Xterm.color.gray('secret') + ' 無法操作 ' + Xterm.color.gray(Config.bucket, true) + ' 此 Bucket！')
      : Display.line(true) && typeof closure == 'function' && closure()
  })
}
