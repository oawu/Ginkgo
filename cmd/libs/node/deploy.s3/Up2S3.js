/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path     = require('path')
const FileRead = require('fs').readFileSync
const Display  = require('../Display')
const ScanDir  = require('../ScanDir')
const Config   = require(Path.config).s3

const listObjects = (options, items, closure) => Config.object.listObjectsV2(options, (error, data) => {
  if (error) return Display.line(false, '相關原因：' + error.message)
  
  items = items.concat(data.Contents.map(t => true && {
    name: t.Key,
    hash: t.ETag.replace(/^('|")(.*)\1/g, '$2'),
  }))

  if (!data.IsTruncated)
    return Display.line(items.length) && Display.line(true) && typeof closure == 'function' && closure(items)

  options.ContinuationToken = data.NextContinuationToken
  return listObjects(options, items, closure)
})

const s3Files = closure => {
  Display.line('取得 S3 上檔案')

  listObjects({
    Bucket: Config.bucket,
    Prefix: Config.prefix
  }, [], closure)
}

const localFiles = closure => {
  const md5File  = require('md5-file')

  Display.line('更新檔案 Hash ')
  let localFiles = ScanDir(Path.dist)
  Display.line(localFiles.length)
  localFiles = localFiles.map(file => ({
    name: file.replace(Path.dist, ''),
    hash: Display.line() && md5File.sync(file),
    path: file }))
  Display.line(true)

  return typeof closure == 'function' && closure(localFiles)
}

const filterLocalFiles = (localFiles, s3Files, closure) => {
  Display.line('過濾上傳的檔案')

  let uploadFiles = localFiles.filter(localFile => {
    for (let i = 0; i < s3Files.length; i++)
      if (s3Files[i].name == localFile.name && s3Files[i].hash == localFile.hash)
        return false
    return true
  })

  return Display.line(uploadFiles.length)
    && Display.line(true)
    && typeof closure == 'function'
    && closure(uploadFiles)
}

const uploadFiles = (files, closure) => {
  const Mime = require('mime')

  const putS3Options = {
    ACL: 'public-read',
    // ContentMD5: Buffer.from(file.hash).toString('base64'),
    // CacheControl: 'max-age=5'
  }
  
  Display.line('上傳檔案至 S3 ')
  Display.line(files.length)

  Promise.all(files.map(
    file => new Promise(
      (resolve, reject) => Config.object.putObject({
        Bucket: Config.bucket,
        Key: file.name,
        Body: FileRead(file.path),
        ContentType: Mime.getType(file.path) || 'text/plain',
        ...putS3Options },
        (error, data) => error
          ? reject(error)
          : Display.line() && resolve(data)))))
  .then(_      => Display.line(true) && typeof closure == 'function' && closure())
  .catch(error => Display.line(false, '相關原因：' + error.message))
}

const filterS3Files = (s3Files, localFiles, closure) => {
  Display.line('過濾刪除的檔案')

  let deleteFiles = s3Files.filter(s3File => {
    for (let i = 0; i < localFiles.length; i++)
      if (localFiles[i].name == s3File.name)
        return false
    return true
  })

  return Display.line(deleteFiles.length)
    && Display.line(true)
    && typeof closure == 'function'
    && closure(deleteFiles)
}

const deleteFiles = (files, closure) => {
  Display.line('刪除 S3 的檔案')
  Display.line(files.length)

  Promise.all(files.map(
    file => new Promise(
      (resolve, reject) => Config.object.deleteObject({
        Bucket: Config.bucket,
        Key: file.name },
        (error, data) => error
          ? reject(error)
          : Display.line() && resolve(data)))))
  .then(_      => Display.line(true) && typeof closure == 'function' && closure())
  .catch(error => Display.line(false, '相關原因：' + error.message))
}

module.exports = closure => Display.title('部署至 AWS S3') &&
  localFiles(localFiles =>
    s3Files(s3Files =>
      filterLocalFiles(localFiles, s3Files, files =>
        uploadFiles(files, _ =>
          filterS3Files(s3Files, localFiles, files =>
            deleteFiles(files,
              closure))))))
