/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

module.exports = {
  dest: 'dist',
  entry: 'src',
  
  enablePHP: {
    maxBuffer: 1024 * 1024,
  },
  
  serve: {
    iconByGinkgo: false, // 是否採用 Ginkgo 內的 icon 函式
    autoOpenBrowser: true,
    autoCleanCache: false,

    dirs: {
      icon: 'icon', // 圖示
      scss: 'scss', // scss
      css: 'css',   // css
      img: 'img',   // 圖片
      js: 'js',     // js
    },

    watch: { // Live reload
      formats: ['.php', '.html', '.css', '.js'],
      ignoreDirs: ['icon'], // 不監聽的目錄
      waitTime: 10,         // 初始監聽 timer
      debounceTime: 550,    // 監聽 timer
    },

    server: {
      ssl: { // /cfg/ssl
        key: 'server.key',
        cert: 'server.crt',
      },

      domain: '127.0.0.1',

      port: {
        min: 8000,
        max: 8003,
        default: 8001,
      },
      
      utf8Exts: ['.html', '.css', '.js', '.json', '.text'], // 採用 utf8 編碼的副檔名
    },

    compass: {
      outputStyle: 'compact', // 選擇輸出的 css 類型，'nested' 有縮排 沒壓縮，會有 @charset "UTF-8";   'expanded' 沒縮排 沒壓縮，會有 @charset "UTF-8";   'compact' 有換行 有壓縮(半壓縮)，會有 @charset "UTF-8";   'compressed' 沒縮排 有壓縮(全壓縮)，沒有 @charset "UTF-8";
      lineComments: false,    // 在 css 中加入註解相對應於 scss 的第幾行，false、true
      relative: true,         // 是否使用相對位置，若是仰賴 http_path 則設為 false
      imports: [],            // 其他要匯入的資源
      uri: null,              // 網域(domain)後面的目錄
    }
  },

  build: {
    minify: true,
    autoOpenFolder: true,

    jsPresets: [ // JS minify 時外加的轉譯
      '@babel/preset-env',
    ],


    ignoreDirs: [], // 忽略的目錄

    exts: [ // 允許的副檔名
      '.php', '.html', '.txt', '.css', '.js', '.eot', '.svg', '.ttf', '.woff', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.xml', '.json'
    ]
  },
  deploy: {
    github: {
      commitMessage: '🚀 部署！'
    },
    s3: {
      prefix: null,
      ignoreDirs: [], // 忽略的目錄
      putOptions: {
        ACL: 'public-read',
        // CacheControl: 'max-age=5', // Cache 時間
      }
    }
  }
}
