/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path       = require('path')
const FileSystem = require('fs')
  const Exists   = FileSystem.existsSync
  const DirRead  = FileSystem.readdirSync
  const FileStat = FileSystem.statSync

const ScanDir = dir => Exists(dir)
  ? DirRead(dir).map(file => file[0] !== '.'
    ? FileStat(dir + file).isDirectory()
      ? ScanDir(dir + file + Path.sep)
      : [dir + file]
    : null).filter(t => t !== null).reduce((a, b) => a.concat(b), [])
  : []

module.exports = ScanDir
