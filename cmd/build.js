/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

require('./libs/node/Init')
  .title('Ginkgo 編譯工具')
  .path('config', ['cmd', 'config', 'build.js'])
  .path('phpEntry', ['cmd', 'libs', 'php', 'Main.php'])
  .gola((load, done) =>
    load('build/Check')(_ =>
      load('build/Dist')(_ =>
        load('build/Finish')(
          done))))
