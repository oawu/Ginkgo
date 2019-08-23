/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Display = require('../Display')
const Path    = require('path')

let data = {
  ...require('fs').existsSync(
    Path.cmd + 'deploy.config.js')
      ? require(Path.cmd + 'deploy.config')
      : require(Path.cmd + 'deploy.config.sample')
}

const fetch = (title, closure) => {
  Display.title(title)
  Display.line('取得參數')

  const argvs = process.argv.slice(2)

  for(let i = 0; i < argvs.length; i++) {
    if (['-g', '--goal'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-' && ['aws-s3', 'gh-pages', 's3', 'github'].indexOf(argvs[i + 1].toLowerCase()) !== -1)
        data.goal = ['aws-s3', 's3'].indexOf(argvs[i + 1]) !== -1 ? 'aws-s3' : 'gh-pages'

    if (['-m', '--minify'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-' && ['0', '1', 'true', 'false'].indexOf(argvs[i + 1].toLowerCase()) !== -1)
        data.minify = argvs[i + 1] === '0' || argvs[i + 1] === 'false' ? false : true
    
    if (['-b', '--bucket'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        data.bucket = argvs[i + 1]

    if (['-a', '--access'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        data.access = argvs[i + 1]

    if (['-s', '--secret'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        data.secret = argvs[i + 1]

    if (['-d', '--domain'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        data.domain = argvs[i + 1]

    if (['-f', '--folder'].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        data.folder = argvs[i + 1]
      else if (typeof argvs[i + 1] === 'undefined' || argvs[i + 1][0] == '-')
        data.folder = ''
  }
  
  Display.line(true)

  return this
}

module.exports = {
  s3: null,
  data: data,
  plugins: [],
  fetch: fetch,
  githubUris: [],
  
  s3Files: [],
  localFiles: [],
  uploadFiles: [],
  deleteFiles: [],

  oriBranch: null,
  setPlugins: () => [],
  
  minifyRate: '100%(-0%)',
  startAt: new Date().getTime()
}
