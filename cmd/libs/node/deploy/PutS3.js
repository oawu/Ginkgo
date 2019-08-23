/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display  = require('../Display')
const Xterm    = require('../Xterm')
const Argv     = require('./Argv')
const FileRead = require('fs').readFileSync
const Mime     = require('mime')
const Rollback = require('./Rollback')
const md5File  = require('md5-file')

const putS3Options = {
  ACL: 'public-read',
  // ContentMD5: Buffer.from(file.hash).toString('base64'),
  // CacheControl: 'max-age=5'
}

const listObjects = (options, items, closure) => Argv.s3.listObjectsV2(options, (error, data) => {
  if (error)
    return Display.line(false) || Rollback(['相關原因：' + error.message])
  
  items = items.concat(data.Contents.map(t => true && {
    name: t.Key,
    hash: t.ETag.replace(/^('|")(.*)\1/g, '$2'),
  }))

  if (!data.IsTruncated)
    return Display.line(items.length) && Display.line(true) && (Argv.s3Files = items) && closure && closure()

  options.ContinuationToken = data.NextContinuationToken
  return listObjects(options, items, closure)
})

const filterLocalFiles = closure => true &&
  Display.line('過濾上傳的檔案') &&
  Display.line(Argv.localFiles.length) &&

  (Argv.uploadFiles = Argv.localFiles.filter(localFile => {
    Display.line()
  
    for (let i = 0; i < Argv.s3Files.length; i++)
      if (Argv.s3Files[i].name == localFile.name && Argv.s3Files[i].hash == localFile.hash)
        return false
  
    return true
  })) &&

  Display.line(true) && closure && closure()

const filterS3Files = closure => true &&
  Display.line('過濾刪除的檔案') &&
  Display.line(Argv.s3Files.length) &&

  (Argv.deleteFiles = Argv.s3Files.filter(s3File => {
    Display.line()
  
    for (let i = 0; i < Argv.localFiles.length; i++)
      if (Argv.localFiles[i].name == s3File.name)
        return false

    return true
  })) &&

  Display.line(true) && closure && closure()

const s3Files = closure => true &&
  Display.line('取得 S3 上檔案') &&
  listObjects({ Bucket: Argv.data.bucket, Prefix: Argv.data.folder }, [],
    closure)

const uploadFiles = closure => true &&
  Display.line('上傳檔案至 S3 ') &&
  Display.line(Argv.uploadFiles.length) &&
  Promise.all(Argv.uploadFiles.map(
    file => new Promise(
      (resolve, reject) => Argv.s3.putObject({ Bucket: Argv.data.bucket, Key: file.name, Body: FileRead(file.path), ContentType: Mime.getType(file.path) || 'text/plain', ...putS3Options },
        (error, data) => error
          ? reject(error)
          : Display.line() && resolve(data)))))
  .then(() => Display.line(true) && closure && closure())
  .catch(error => Display.line(false) || Rollback(['相關原因：' + error.message]))

const deleteFiles = closure => true &&
  Display.line('刪除 S3 的檔案') &&
  Display.line(Argv.deleteFiles.length) &&
  Promise.all(Argv.deleteFiles.map(
    file => new Promise(
      (resolve, reject) => Argv.s3.deleteObject({ Bucket: Argv.data.bucket, Key: file.name },
        (error, data) => error
          ? reject(error)
          : Display.line() && resolve(data)))))
  .then(() => Display.line(true) && closure && closure())
  .catch(error => Display.line(false) || Rollback(['相關原因：' + error.message]))

module.exports = (title, closure) => true &&
  Display.title(title) &&
  Display.line('更新檔案 Hash ') &&
  Display.line(Argv.localFiles.length) &&
  Argv.localFiles.map(t => t.hash = Display.line() && md5File.sync(t.path)) &&
  Display.line(true) &&

  s3Files(
    () => filterLocalFiles(
      () => uploadFiles(
        () => filterS3Files(
          () => deleteFiles(closure)))))
