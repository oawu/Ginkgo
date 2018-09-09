/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

module.exports.run = function(argv, _v) {
  const argvs = argv.slice(2);

  for(let i = 0; i < argvs.length; i++) {
    if (['-g', '--github'].indexOf(argvs[i].toLowerCase()) !== -1)
      _v.cho.goal = '1';

    if (['-3', '--s3'].indexOf(argvs[i].toLowerCase()) !== -1)
      _v.cho.goal = '2';

    if (['-m', '--minify'].indexOf(argvs[i].toLowerCase()) !== -1)
      _v.cho.minify = '1';

    if (['-nm', '--no-minify'].indexOf(argvs[i].toLowerCase()) !== -1)
      _v.cho.minify = '2';
    
    if (['-b', '--bucket'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        _v.s3Info.bucket = argvs[i + 1];

    if (['-a', '--access'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        _v.s3Info.access = argvs[i + 1];

    if (['-s', '--secret'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        _v.s3Info.secret = argvs[i + 1];

    if (['-f', '--folder'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        _v.s3Info.folder = argvs[i + 1];

    if (['-d', '--domain'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        _v.s3Info.domain = argvs[i + 1];
  }
};