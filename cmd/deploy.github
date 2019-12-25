/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

require('./libs/node/Init')
  .title('Ginkgo Github 部署工具')
  .path('config', ['cmd', 'config', 'deploy.github.js'])
  .gola((load, done) =>
    load('deploy.github/Check')(_ =>
      load('deploy.github/Up2Github')(_ =>
        load('deploy.github/Finish')(
          done))))
