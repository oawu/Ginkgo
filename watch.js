/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path    = require('path')

Path.root     = Path.resolve(__dirname) + Path.sep
Path.icon     = Path.root + 'src/Font' + Path.sep
Path.scss     = Path.root
Path.iconHtml = Path.root  + 'lib' + Path.sep + 'node'  + Path.sep + 'watch'  + Path.sep + 'icon.html'

const Loader = require('./lib/node/Ginkgo').load
const Load   = Loader('Ginkgo').loadWatch

process.stdout.write('\x1b[2J')
process.stdout.write('\x1b[0f')

Loader('Display').mainTitle('Ginkgo 開發工具')

Loader('EnvCheck')('檢查環境', Load('Check'),
  Load('WatchIcon').bind(null, 'Watch icon 目錄',
    Load('WatchSCSS').bind(null, 'Watch SCSS 目錄',
      Load('Ready').bind(null, '準備開發'))))
