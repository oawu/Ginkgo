/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path   = require('path')

Path.root     = Path.resolve(__dirname) + Path.sep

Path.plugin  = Path.root + 'lib' + Path.sep + 'plugin' + Path.sep

Path.js      = Path.root + 'js'  + Path.sep
Path.css     = Path.root + 'css' + Path.sep

const Loader = require('./lib/node/Ginkgo').load
const Load   = Loader('Ginkgo').loadDeploy

process.stdout.write('\x1b[2J')
process.stdout.write('\x1b[0f')

Loader('Display').mainTitle('Ginkgo 部署工具')

Loader('EnvCheck')('檢查環境', Load('Check'), () => {

  const Argv = Load('Argv')
  Argv.fetch('取得參數')
  Argv.setPlugins = () => [
    // {title: 'plugin1', cmd: 'php', file: 'index.php', argv: '-a ' + Argv.data.goal }, // 取得內部資訊（當 Plugin checkPlugins 才決定）
    // {title: 'plugin2', cmd: 'php', file: 'index.php', argv: '-a {plugin1}' },         // 取得 plugin1 的結果
    // {title: 'plugin3', cmd: 'php', file: 'index.php', argv: '-a {{-b}}' },            // 取得 node deploy 的參數 -b 值
  ]
  
  let pushNewBranch = () => Load('PushNewBranch')('記錄與更新',
    Load('Finish').bind(null, '上傳完成'))
  
  let tmpStep = () => Argv.data.goal == 'aws-s3'
    ? Load('PutS3')('上傳至 AWS S3', pushNewBranch)
    : pushNewBranch()

  let checkGit = () => Load('CheckGit')('確認 Git 狀態',
    Load('GitNewBranch').bind(null, '設定部署分支',
      Load('Plugin').bind(null, '執行外掛',
        Load('DeployFile').bind(null, '整理檔案',
          Load('MinifyFile').bind(null, '壓縮檔案', tmpStep),
          tmpStep.bind(null)))))

  Load('Menu').default(
    Load('CheckS3').bind(null, '確認 S3 資訊', checkGit),
    Load('CheckGithub').bind(null, '確認 GitHub 資訊', checkGit))
})
