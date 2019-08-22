const path = require('path')

module.exports = {
  // publicPath: 'Ginkgo',
  // outputDir: '../Ginkgo',
  // devServer: {
  //   host: 'dev.ginkgo.ioa.tw'
  // }

  // outputDir: 'dist',
  // assetsDir: 'asset',

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
