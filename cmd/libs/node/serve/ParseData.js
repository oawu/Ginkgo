/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display = require('../Display')
const iconByGinkgo = require(require('path').config).scss.iconByGinkgo

module.exports = (name, data) => {
  const importStr = iconByGinkgo ? '@import "GinkgoFont";' : '@import "compass/css3/font-face";'
  const basePath  = iconByGinkgo ? '../icon/' : ''

  const className = name ? name + '-' : ''
  const fontFace  = 'icon' + (name ? '-' + name : '')
  const fontFiles = name ? name : 'icomoon'

  data = data.match(/\.icon-[a-zA-Z_\-0-9]*:before\s?\{\s*content:\s*"[\\A-Za-z0-9]*";(\s*color:\s*#[A-Za-z0-9]*;)?\s*}/g)
  data = Array.isArray(data) ? data.map(v => v.replace(/^\.icon-/g, '.icon-' + className).replace(/\n/g, ' ').replace(/\{\s*/g, '{ ').replace(/\s+/g, ' ')) : []
  data = data.sort((a, b) => a >= b ? a == b ? 0 : 1 : -1);

  return '//' + Display.LN +
         '// @author      OA Wu <comdan66@gmail.com>' + Display.LN +
         '// @copyright   Copyright (c) 2015 - ' + new Date().getFullYear() + ', Ginkgo' + Display.LN +
         '// @license     http://opensource.org/licenses/MIT  MIT License' + Display.LN +
         '// @link        https://www.ioa.tw/' + Display.LN +
         '//' + Display.LN +
         Display.LN +
         importStr + Display.LN +
         (data.length
          ? Display.LN +
            '@include font-face("' + fontFace + '", font-files(' + Display.LN +
            '  "' + basePath + fontFiles + '/fonts/icomoon.eot",' + Display.LN +
            '  "' + basePath + fontFiles + '/fonts/icomoon.woff",' + Display.LN +
            '  "' + basePath + fontFiles + '/fonts/icomoon.ttf",' + Display.LN +
            '  "' + basePath + fontFiles + '/fonts/icomoon.svg"));' + Display.LN +
            Display.LN +
            '*[class^="' + fontFace +'-"]:before, *[class*=" ' + fontFace +'-"]:before {' + Display.LN +
            '  font-family: "' + fontFace + '";' + Display.LN +
            '  speak: none;' + Display.LN +
            '  font-style: normal;' + Display.LN +
            '  font-weight: normal;' + Display.LN +
            '  font-variant: normal;' + Display.LN +
            '}' + Display.LN +
            Display.LN +
            data.join(Display.LN) +
            Display.LN
          : '')
}
