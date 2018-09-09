/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Ginkgo = require('../Ginkgo');


function minify(_v, closure) {
  Ginkgo.print('\n' + Ginkgo.cc(' 【是否壓縮】', 'y') + '\n');
  Ginkgo.print(Ginkgo.cc(_v.cho.minify == '1' ? ' ➜' : '  ', 'g1') + Ginkgo.cc('  1. 要！我要將一切壓縮', _v.cho.minify == '1' ? 'g2' : undefined) + Ginkgo.cc(' - ' + 'Yes, compress them.',  _v.cho.minify == '1' ? 'g0' : 'w0') + "\n");
  Ginkgo.print(Ginkgo.cc(_v.cho.minify == '2' ? ' ➜' : '  ', 'g1') + Ginkgo.cc('  2. 不要，我要保持原樣', _v.cho.minify == '2' ? 'g2' : undefined) + Ginkgo.cc(' - ' + 'No, keep them original.',  _v.cho.minify == '2' ? 'g0' : 'w0') + "\n");

  const switcher = function(c) {
    _v.cho.minify = c;
    return closure(_v.cho);
  };

  if (['1', '2'].indexOf(_v.cho.minify) !== -1) {
    switcher(_v.cho.minify);
  } else {
    Ginkgo.print("\n");
    Ginkgo.question(['1', '2'], switcher);
  }
}

module.exports.run = function(_v, closure) {
  Ginkgo.print('\n' + Ginkgo.cc(' 【選擇目標】', 'y') + '\n');
  Ginkgo.print(Ginkgo.cc(_v.cho.goal == '1' ? ' ➜' : '  ', 'g1') + Ginkgo.cc('  1. GitHub Pages', _v.cho.goal == '1' ? 'g2' : undefined) + Ginkgo.cc(' - ' + 'gh-pages branch',        _v.cho.goal == '1' ? 'g0' : 'w0') + "\n");
  Ginkgo.print(Ginkgo.cc(_v.cho.goal == '2' ? ' ➜' : '  ', 'g1') + Ginkgo.cc('  2. Amazon S3   ', _v.cho.goal == '2' ? 'g2' : undefined) + Ginkgo.cc(' - ' + 'Simple Storage Service', _v.cho.goal == '2' ? 'g0' : 'w0') + "\n");

  const switcher = function(c) {
    _v.cho.goal = c;
    return minify(_v, closure);
  };

  if (['1', '2'].indexOf(_v.cho.goal) !== -1) {
    switcher(_v.cho.goal);
  } else {
    Ginkgo.print("\n");
    Ginkgo.question(['1', '2'], switcher);
  }
};