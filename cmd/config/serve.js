/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

module.exports = {
  dir: {
    entry: 'src'
  },
  dirName: { // View 內的目錄名稱
    iconDir: 'icon', // 圖示
    scssDir: 'scss', // scss
    cssDir: 'css',   // css
    imgDir: 'img',   // 圖片
    jsDir: 'js',     // js
  },
  scss: {
    iconByGinkgo: false, // 是否採用 Ginkgo 內的 icon 函式
  },
  watch: {
    formats: ['.php', '.html', '.css', '.js'], // Live reload 副檔名
    ignoreDirs: ['icon'], // 不監聽的目錄
    runTimer: 250,        // 監聽 timer
    waitTimer: 10,        // 初始監聽 timer
  },
  server: {
    https: {
      enable: false,
      key: 'server.key',  // base path: cmd/config/https/
      cert: 'server.crt', // base path: cmd/config/https/
    },

    domain: '127.0.0.1',
    minPort: 8000,
    maxPort: 8999,
    defaultPort: null,
    utf8Exts: ['.html', '.css', '.js', '.json', '.text'] // 採用 utf8 編碼的副檔名
  },
  compass: {
    outputStyle: 'compact', // 選擇輸出的 css 類型，'nested' 有縮排 沒壓縮，會有 @charset "UTF-8";   'expanded' 沒縮排 沒壓縮，會有 @charset "UTF-8";   'compact' 有換行 有壓縮(半壓縮)，會有 @charset "UTF-8";   'compressed' 沒縮排 有壓縮(全壓縮)，沒有 @charset "UTF-8";
    lineComments: false,    // 在 css 中加入註解相對應於 scss 的第幾行，false、true
    relative: true,         // 是否使用相對位置，若是仰賴 http_path 則設為 false
    imports: [],            // 其他要匯入的資源
    uri: null,              // 網域(domain)後面的目錄
  }
}
