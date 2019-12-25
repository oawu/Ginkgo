/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

require('./libs/node/Init')
  .title('Ginkgo S3 部署工具')
  .path('config', ['cmd', 'config', 'deploy.s3.js'])
  .gola((load, done) =>
    load('deploy.s3/Check')(_ =>
      load('deploy.s3/Up2S3')(_ =>
        load('deploy.s3/Finish')(
          done))))
