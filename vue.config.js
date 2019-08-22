const Path = require('path')

// console.error();


module.exports = {
  // publicPath: '',             // 網址後面的 uri
  // outputDir: 'dist',          // build 完後存放的位置
  // assetsDir: 'asset',         // build 完後在 outputDir 內的 assets 目錄

  // devServer: {                // 開發時的設定
  //   host: 'dev.ginkgo.ioa.tw' // 開發時的 domain
  // }

  pages: {
    index: {
      entry: 'src/main.js',
      template: 'src/Public/index.html',
      filename: 'index.html',
    },
  }

  // chainWebpack: config => {
  //   config.module
  //     .rule('images')
  //       .use('url-loader')
  //         .loader('url-loader')
  //         .tap(options => Object.assign(options, { limit: 1 }))
  // }
}
