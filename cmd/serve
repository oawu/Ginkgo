/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

require('./libs/node/Init')
  .title('Ginkgo 開發工具')
  .path('config', ['cmd', 'config', 'serve.js'])
  .path('compass', ['cmd', 'libs', 'scss', ''])
  .path('phpEntry', ['cmd', 'libs', 'php', 'Main.php'])
  .gola((load, done) =>
    load('serve/Check')(_ =>
      load('serve/Watch')(_ =>
        load('serve/Server')(_ =>
          load('serve/Ready')(
            done)))))
