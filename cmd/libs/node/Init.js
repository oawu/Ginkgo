/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path = require('path')
  Path.root = Path.resolve(__dirname, ('..' + Path.sep).repeat(3)) + Path.sep
  Path.cmd  = Path.root + 'cmd' + Path.sep
  Path.libs = Path.cmd  + 'libs' + Path.sep

const Init = function() {}
Init.title = title => require('.' + Path.sep + 'Display').mainTitle(title) && Init
Init.path = (key, dirs) => (Path[key] = Path.root + dirs.join(Path.sep), Init)
Init.gola = closure => require('.' + Path.sep + 'CheckEnv')(_ => closure(path => require('.' + Path.sep + path), require('.' + Path.sep + 'Done')))

module.exports = Init
