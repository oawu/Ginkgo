/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path = require('path')

module.exports = {
  goal:   null, // gh-pages、aws-s3
  minify: null, // true、false
  bucket: null,
  access: null,
  secret: null,
  folder: Path.root.split(Path.sep).map(t => t.trim()).filter(v => v.length).pop(),
  domain: null,
}
