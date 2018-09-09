/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

// 1. 檢查是否 commit
// 2. 選擇方式
// mini 錯誤時
 

const Ginkgo = require('./libs/node/Ginkgo');
const AskS3 = require('./libs/node/demo/askS3');

const Path = require('path');

const _v = {
  cho: {
    goal: null,
    minify: null,
    branchName: function() {
      return _v.cho.goal == '1' ? 'gh-pages' : 'aws-s3';
    }
  },
  s3Info: require('fs').existsSync('./libs/node/demo/config.js') ? require('./libs/node/demo/config').s3Info() : {
    bucket: null,
    access: null,
    secret: null,
    folder: Path.resolve(__dirname, '..' + Path.sep).split(Path.sep).pop(),
    domain: null,
  },
  gitOri: {
    url: [],
    branch: null,
  }
};


function main(first) {

  if (first) {
    process.stdout.write('\x1b[2J');
    process.stdout.write('\x1b[0f');
    Ginkgo.print('\n' + Ginkgo.cc(' 【Ginkgo 上傳工具】', 'R') + '\n');
    Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + '注意喔，過程中請勿隨意結束！' + '\n');
    Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + Ginkgo.ctrlC());
  } else {
    Ginkgo.print('\n');
  }

  function finish() {
    Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + '趕緊去看最新版的吧！' + '\n');

    if (_v.cho.goal == '1' && _v.gitOri.url.length == 2) {
      Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + '因為快取問題，請稍待 ' + Ginkgo.cc('1 分鐘', 'w2') + ' 後再重新整理頁面。' + '\n');
      Ginkgo.print(Ginkgo.cc('    ➤ ', 'C') + '網址：' + Ginkgo.cc('https://' + _v.gitOri.url[0] + '.github.io/' + _v.gitOri.url[1] + '/', 'b2', undefined, 'underline') + '\n');
    }

    Ginkgo.print('\n\n');
  }

  function pushNewBr() {
    require('./libs/node/demo/pushBr').run(_v, function(cho) {
      Ginkgo.print('\n' + Ginkgo.cc(' 【上傳完成】', 'R') + '\n');
      return finish();
    });
  }

  function minifyFiles() {
    require('./libs/node/demo/minify').run(_v, function(cho) {
      Ginkgo.print('\n' + Ginkgo.cc(' 【記錄與更新】', 'y') + '\n');
      return pushNewBr();
    });
  }

  function checkEnv() {
    require('./libs/node/demo/check').run(_v, function(cho) {
      Ginkgo.print('\n' + Ginkgo.cc(' 【上傳 GitHub 頁面】', 'y') + '\n');
      return require('./libs/node/demo/newBr').run(_v, function(cho) {
        
        if (cho.minify == 2) {
          Ginkgo.print('\n' + Ginkgo.cc(' 【記錄與更新】', 'y') + '\n');
          return pushNewBr();
        }

        Ginkgo.print('\n' + Ginkgo.cc(' 【壓縮檔案】', 'y') + '\n');
        return minifyFiles();
      });
    });
  }

  require('./libs/node/demo/choice').run(_v, function(cho) {
    Ginkgo.print('\n' + Ginkgo.cc(' 【檢查環境】', 'y') + '\n');
    return cho.goal == '1' ? checkEnv() : AskS3.run(_v, checkEnv);
  });
}

Ginkgo.init(function(inited) {
  require('./libs/node/demo/argvs').run(process.argv, _v);
  require('command-exists');
  return main(inited);
});
