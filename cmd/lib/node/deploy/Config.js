/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

let App      = null
let Color    = null
let Path     = null
let Sep      = null
let Progress = null

const getArgv = keys => {
  const argvs = process.argv.slice(2)
  for(let i = 0; i < argvs.length; i++)
    if (keys.indexOf(argvs[i]) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        return argvs[i + 1]
  return null
}

module.exports = (app, closure) => {
  App = app,
    Color = App.color,
    Progress = App.progress,
    Path = App.path('$'),
      Sep = Path.sep

  process.stdout.write("\n" + ' ' + Color.yellow('【檢查部署環境】') + "\n")
  
  const CmdExists = require('command-exists').sync
  const FileSystem = require('fs')
  const queue = new App.queue()

  queue.enqueue(next => Progress.block('檢查設定檔是否存在', Progress.cmd('執行動作', 'check ' + Path.relative(App.path('root'), App.path('cfg-main')) + ' is exists'))
    .doing(progress => FileSystem.existsSync(App.path('cfg-main'))
      ? progress.success('存在')
      : progress.failure(null, '尚未設定 ' + Color.lGray('Serve') + ' 設定檔！'))
    .go(next))

  queue.enqueue(next => Progress.block('取得設定檔', Progress.cmd('執行動作', 'get ' + Path.relative(App.path('root'), App.path('cfg-main')) + ' file'))
    .total(5)
    .doing(progress => {
      App.config = require(App.path('cfg-main'))
      progress.counter
      
      App.path('entry', [App.config.entry, ''])
      progress.counter

      App.path('dest', [App.config.dest, ''])
      progress.counter

      App.config.build.ignoreDirs = App.config.build.ignoreDirs.map(
        dir => Path.normalize(
          App.path('entry') + dir + Sep)).reduce((a, b) => a.indexOf(b) == -1 ? (a.push(b), a) : a, []).map(dir => new RegExp('^' + dir, 'gm'))
      progress.counter

      App.config.build.exts = App.config.build.exts.map(ext => ext.toLowerCase())
      progress.success()
    })
    .go(next))

  queue.enqueue(next => Progress.block('檢查開發目錄是否存在', Progress.cmd('執行動作', 'check ' + Path.relative(App.path('root'), App.path('entry')) + ' is exists'))
    .doing(progress => FileSystem.existsSync(App.path('entry'))
      ? progress.success('存在')
      : progress.failure(null, '開發目錄不存在！'))
    .go(next))

  queue.enqueue(next => Progress.block('檢查參數', Progress.cmd('執行動作', 'check argvs'))
    .total(3)
    .doing(progress => {
      App.config.argvs = {}
      progress.counter

      const goal = getArgv(['-G', '--goal'])
      App.config.argvs['--goal'] = goal === null || ['s3', 'github'].indexOf(goal.toLowerCase()) == -1 ? 'github' : goal.toLowerCase()
      progress.counter

      progress.success()
    })
    .go(next))
  
  queue.enqueue(next => App.config.argvs['--goal'] != 's3'
    ? Progress.block('檢查 GitHub 參數', Progress.cmd('執行動作', 'check GitHub argvs'))
      .total(6)
      .doing(progress => {
        try {
          const output = require('child_process').execSync('git remote get-url origin', { stdio: 'pipe' }).toString()
          const match = /^git@github\.com:(?<account>.*)\/(?<repository>.*)\.git/gi.exec(output) || /^https:\/\/github\.com\/(?<account>.*)\/(?<repository>.*)\.git/gi.exec(output)
          if (!match) throw new Error('此專案非 Github 並且沒有設定資訊');
          App.config.deploy.github.account    = match.groups.account
          App.config.deploy.github.repository = match.groups.repository
        } catch(e) {
          App.config.deploy.github.account = null
          App.config.deploy.github.repository = null
        }

        const account    = getArgv(['-A', '--account'])
        const repository = getArgv(['-R', '--repository'])
        const branch     = getArgv(['-B', '--branch'])
        const message    = getArgv(['-M', '--message'])
        
        App.config.deploy.github.account = account === null ? App.config.deploy.github.account : account, progress.counter
        App.config.deploy.github.repository = repository === null ? App.config.deploy.github.repository : repository, progress.counter
        App.config.deploy.github.branch = branch === null ? 'gh-pages' : branch, progress.counter
        App.config.deploy.github.commitMessage = message === null || message === '' ? App.config.deploy.github.commitMessage : message

        App.config.deploy.github.account === null ? progress.failure(null, '部署至 GitHub 需給予正確的 ' + Color.lGray('--account') + ' 參數') : progress.counter
        App.config.deploy.github.repository === null ? progress.failure(null, '部署至 GitHub 需給予正確的 ' + Color.lGray('--repository') + ' 參數') : progress.counter

        progress.success()
      })
      .go(next)
    : Progress.block('檢查 S3 參數與功能', Progress.cmd('執行動作', 'check S3 argvs、features'))
      .total(8)
      .doing(progress => {
        const bucket = getArgv(['-B', '--bucket'])
        const access = getArgv(['-A', '--access'])
        const secret = getArgv(['-S', '--secret'])

        bucket === null ? progress.failure(null, '部署至 S3 需給予正確的 ' + Color.lGray('--bucket') + ' 參數') : progress.counter
        access === null ? progress.failure(null, '部署至 S3 需給予正確的 ' + Color.lGray('--access') + ' 參數') : progress.counter
        secret === null ? progress.failure(null, '部署至 S3 需給予正確的 ' + Color.lGray('--secret') + ' 參數') : progress.counter

        App.config.deploy.s3.bucket = bucket
        progress.counter

        App.config.deploy.s3.putOptions = App.config.deploy.s3.putOptions || {}
        App.config.deploy.s3.prefix = (App.config.deploy.s3.prefix || '').trim('/')
        App.config.deploy.s3.prefix = App.config.deploy.s3.prefix ? App.config.deploy.s3.prefix + '/' : ''
        progress.counter

        App.config.deploy.s3.ignoreDirs = App.config.deploy.s3.ignoreDirs
          .reduce((a, b) => a.indexOf(b) == -1 ? (a.push(b), a) : a, [])
          .map(dir => ({ s3: new RegExp('^' + App.config.deploy.s3.prefix + Path.normalize(dir + Sep).replace(Sep, '/'), 'gm'), local: new RegExp('^' + Path.normalize(App.path('dest') + dir + Sep), 'gm') }))
        progress.counter

        const S3 = require('aws-sdk/clients/s3')
        App.config.deploy.s3.instance = new S3({
          accessKeyId: access,
          secretAccessKey: secret })
        progress.counter

        App.config.deploy.s3.instance.listBuckets((error, data) => !error
          ? data.Buckets.map(t => t.Name).indexOf(App.config.deploy.s3.bucket) == -1
            ? progress.failure(null, '您這組 ' + Color.gray('access') + '、' + Color.gray('secret') + ' 無法操作 ' + Color.lGray(Config.bucket) + ' 此 Bucket！')
            : progress.success()
          : progress.failure(null, error))
      })
      .go(next))

  queue.enqueue(next => App.config.enablePHP ? next() : closure(App.config))

  queue.enqueue(next => Progress.block('檢查編譯參數', Progress.cmd('執行動作', 'check argvs'))
    .total(2)
    .doing(progress => {
      App.config.build.argvs = {}

      const env = getArgv(['-E', '--env'])
      App.config.build.argvs['--env'] = env === null || ['Development', 'Testing', 'Staging', 'Production'].indexOf(env) == -1 ? 'Development' : env
      progress.counter

      const baseURL = getArgv(['-U', '--base-url'])
      baseURL === null || (App.config.build.argvs['--base-url'] = baseURL)
      progress.success()
    })
    .go(next))

  queue.enqueue(next => Progress.block('檢查是否有 PHP 指令', Progress.cmd('執行動作', 'check php command'))
    .doing(progress => CmdExists('php')
      ? progress.success('有')
      : progress.failure(null, '找不到 PHP 指令，部署過程中會使用到 PHP 指令！'))
    .go(next))

  queue.enqueue(next => Progress.block('檢查 PHP 主要檔案是否存在', Progress.cmd('執行動作', 'check ' + Path.relative(App.path('root'), App.path('lib-php-main')) + ' is exists'))
    .doing(progress => FileSystem.existsSync(App.path('lib-php-main'))
      ? progress.success('存在')
      : progress.failure(null, 'PHP 主要檔案 ' + Color.lGray(Path.relative(App.path('root'), App.path('lib-php-main'))) + ' 不存在！'))
    .go(next))

  return queue.enqueue(next => closure(App.config))
}
