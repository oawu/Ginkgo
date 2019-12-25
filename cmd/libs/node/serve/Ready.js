/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display = require('../Display')
const Print   = require('../Print')

module.exports = closure =>
  Display.title('準備開發') &&
  Print(' '.repeat(3) + '🎉 Yes! 環境已經就緒惹！' + Display.LN) &&
  Print(' '.repeat(3) + '🚀 Go! Go! Go! 趕緊來開發囉！' + Display.LN) &&
  Display.title('以下為紀錄') &&
  require('../Bus').emit('readied', true) &&
  typeof closure == 'function' &&
  closure()
