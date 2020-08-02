/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2020, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

let App      = null
let Path     = null
let Sep      = null
let Progress = null

const FileSystem  = require('fs')
const filterGitignore = true

const ScanDir = dir => FileSystem.existsSync(dir) ? FileSystem.readdirSync(dir).map(file => file !== '.' && file !== '..' ? FileSystem.statSync(dir + file).isDirectory() ? ScanDir(dir + file + Sep) : [dir + file] : null).filter(t => t !== null).reduce((a, b) => a.concat(b), []) : []
const windowPath =  str => process.platform === 'win32' ? str.replace(/\\/g, "/") : str

module.exports = (app, closure) => {
  App = app
  Progress = App.progress
  Path = App.path('$')
  Sep = Path.sep

  process.stdout.write("\n" + ' ' + App.color.yellow('【部署至 AWS S3】') + "\n")

  const Mime = require('mime')
  const md5File = require('md5-file')
  const minDist  = Path.relative(App.path('root'), App.path('dest'))  + Sep
  const minEntry = Path.relative(App.path('root'), App.path('entry')) + Sep
  const gitignore = App.path('dest') + '.gitignore'
  const listObjects = (options, closure, items = []) => App.config.deploy.s3.instance.listObjectsV2(options, (error, data) => {
      if (error) return closure(null)
      else return items = items.concat(data.Contents.map(t => true && {
        name: t.Key,
        hash: t.ETag.replace(/^('|")(.*)\1/g, '$2'),
      })), data.IsTruncated
        ? listObjects({ ...options, ContinuationToken: data.NextContinuationToken }, closure, items)
        : closure(items)
    })

  const queue = new App.queue()

  queue.enqueue(next => Progress.block('更新檔案 Hash ')
    .doing(progress => {
      const localFiles = ScanDir(App.path('dest'))
        .filter(file => !App.config.deploy.s3.ignoreDirs.filter(dir => file.match(dir.local)).length)
        .filter(file => !filterGitignore || file != gitignore)
      progress.total(localFiles.length + 1)
      progress.result(localFiles.map(file => {
        return progress.counter, {
          name: windowPath(App.config.deploy.s3.prefix + Path.relative(App.path('dest'), file)),
          hash: md5File.sync(file),
          path: file
        }
      })).success()
    })
    .go((_, localFiles) => next({ localFiles })))
  
  queue.enqueue((next, files) => Progress.block('取得 S3 上檔案')
    .doing(progress => listObjects({
      Bucket: App.config.deploy.s3.bucket,
      Prefix: App.config.deploy.s3.prefix
    }, s3Files => {
      progress.total(s3Files.length + 2), progress.counter
      files.s3Files = s3Files.filter(file => (progress.counter, !App.config.deploy.s3.ignoreDirs.filter(dir => file.name.match(dir.s3)).length))
      progress.result(files).success()
    }))
    .go((_, files) => next(files)))

  queue.enqueue((next, files) => Progress.block('過濾上傳的檔案')
    .total(files.localFiles.length)
    .doing(progress => {
      files.uploadFiles = files.localFiles.filter(localFile => {
        progress.counter
        for (let s3File of files.s3Files)
          if (s3File.name == localFile.name && s3File.hash == localFile.hash)
            return false
        return true
      })
      progress.result(files).success()
    })
    .go((_, files) => next(files)))

  queue.enqueue((next, files) => Progress.block('過濾刪除的檔案')
    .total(files.s3Files.length)
    .doing(progress => {
      files.deleteFiles = files.s3Files.filter(s3File => {
        progress.counter
        for (let localFile of files.localFiles)
          if (localFile.name == s3File.name)
            return false
        return true
      })
      progress.result(files).success()
    })
    .go((_, files) => next(files)))

  queue.enqueue((next, files) => Progress.block('上傳檔案至 S3 ')
    .total(files.uploadFiles.length)
    .doing(progress => Promise.all(files.uploadFiles.map(file => new Promise(
      (resolve, reject) => FileSystem.readFile(file.path, (error, data) => error ? reject(error) : App.config.deploy.s3.instance.putObject({
        Bucket: App.config.deploy.s3.bucket,
        Key: file.name,
        Body: data,
        ContentType: Mime.getType(file.path) || 'text/plain',
        ...App.config.deploy.s3.putOptions
      }, (error, data) => error
        ? reject(error)
        : resolve(progress.counter && data))))))
      .then(_ => progress.success())
      .catch(error => progress.failure(null, error)))
    .go(_ => next(files)))

  queue.enqueue((next, files) => Progress.block('刪除 S3 的檔案')
    .total(files.deleteFiles.length)
    .doing(progress => Promise.all(files.deleteFiles.map(file => new Promise(
      (resolve, reject) => App.config.deploy.s3.instance.deleteObject({
        Bucket: App.config.deploy.s3.bucket,
        Key: file.name,
      }, (error, data) => error
        ? reject(error)
        : resolve(progress.counter && data)))))
      .then(_ => progress.success())
      .catch(error => progress.failure(null, error)))
    .go(closure))
}
