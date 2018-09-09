/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Ginkgo = require('../Ginkgo');

function uploadAwsS3Check(_v, closure) {
  Ginkgo.print('\n' + Ginkgo.cc(' 【以上是否正確】', 'y') + '\n');
  Ginkgo.print(Ginkgo.cc('  ', 'g1') + Ginkgo.cc('  1. 是的，資訊沒錯', undefined) + Ginkgo.cc(' - ' + 'Yes, the information is correct.',  'w0') + "\n");
  Ginkgo.print(Ginkgo.cc('  ', 'g1') + Ginkgo.cc('  2. 不對，我要重寫', undefined) + Ginkgo.cc(' - ' + 'No, the information should be rewritten.',  'w0') + "\n");

  Ginkgo.print("\n");
  Ginkgo.question(['1', '2'], function(cho) {
    return cho == '2' ? info(_v, closure) : closure();
  });
}

function askS3(title, d4, closure, space) {
  const readline = require('readline').createInterface;
  const rl = readline({ input: process.stdin, output: process.stdout });

  rl.question(Ginkgo.cc('    ➤ ', 'C') + title, function(input) {
    rl.close();
    input = input.trim();
    return space || input.length ? closure(input) : askS3(title, d4, closure, space);
  });

  d4 !== null && rl.write(d4);
}

var info = function(_v, closure) {
  Ginkgo.print('\n' + Ginkgo.cc(' 【請輸入 S3 的設定】', 'y') + '\n');

  askS3('Bucket Name：', _v.s3Info.bucket, function(input) {
    _v.s3Info.bucket = input;

    askS3('Access Key ：', _v.s3Info.access, function(input) {
      _v.s3Info.access = input;

      askS3('Secret Key ：', _v.s3Info.secret, function(input) {
        _v.s3Info.secret = input;
          
        askS3('Folder Name：', _v.s3Info.folder, function(input) {
          _v.s3Info.folder = input;
            
          askS3('Domain Url ：', _v.s3Info.domain, function(input) {
            _v.s3Info.domain = input;
                      
            uploadAwsS3Check(_v, closure);
            
          }, false);
        }, true);
      }, false);
    }, false);
  }, false);
};


module.exports = {
  run: info
};