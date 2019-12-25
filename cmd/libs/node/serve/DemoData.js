/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const Path           = require('path')
const FileSystem     = require('fs')
  const ExistsSync   = FileSystem.existsSync
  const FileReadSync = FileSystem.readFileSync

module.exports = (name, data) => {
  const className = name ? name + '-' : ''
  let copyJS = Path.resolve(__dirname + Path.sep + './Copy.js')
  try { copyJS = ExistsSync(copyJS) ? FileReadSync(copyJS, 'utf8') : '' } catch (e) { copyJS = '' }

  name = name === null ? 'icomoon' : name
  data = data.match(/\.icon-[a-zA-Z_\-0-9]*:before\s?\{\s*content:\s*"[\\A-Za-z0-9]*";(\s*color:\s*#[A-Za-z0-9]*;)?\s*}/g)
  data = Array.isArray(data) ? data.map(v => (v = v.replace(/\n/g, ' ').replace(/\{\s*/g, '{ ').replace(/\s+/g, ' ').match(/\.(icon-[a-zA-Z_\-0-9]*):before\s?\{\s*content:\s*"\\([A-Za-z0-9]*)";.*/)) && [v[1], v[1].replace(/^icon-/g, 'icon-' + className), v[2]]).filter(t => t !== null) : []
  
  return '<!DOCTYPE html>' + 
    '<html lang="zh-Hant">' +
      '<head>' +
        '<meta http-equiv="Content-Language" content="zh-tw">' +
        '<meta http-equiv="Content-type" content="text/html; charset=utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">' +
        '<title>Icon Font - Ginkgo！</title>' +
        '<link rel="stylesheet" type="text/css" href="style.css">' +
        '<style type="text/css">*, *:after, *:before { vertical-align: top; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; -moz-osx-font-smoothing: subpixel-antialiased; -webkit-font-smoothing: subpixel-antialiased; -moz-font-smoothing: subpixel-antialiased; -ms-font-smoothing: subpixel-antialiased; -o-font-smoothing: subpixel-antialiased; }h1 span a { color: #1890ff; -moz-transition: color 0.3s; -o-transition: color 0.3s; -webkit-transition: color 0.3s; transition: color 0.3s; }h1 span a:hover { color: #0076e4; }body, h1, h1:after, main, div, div > * { position: relative; display: inline-block; }div > :after, div:before { position: absolute; display: inline-block; }body, h1, main, div > :after { width: 100%; }body, h1 { margin: 0; }main, div > :after { background-color: white; }div, div > * { -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; }h1, div > * { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }div > :after, div:before { left: 0; }div > .ok:after, div > .no:after, div:before { top: 0; }body, div > :after { text-align: center; }body { padding: 0; color: #5a5a5a; font-size: medium; font-family: "微軟正黑體", "Open sans", "Helvetica Neue", HelveticaNeue, Helvetica, Arial, sans-serif; background-color: #ececec; }h1 { height: 72px; line-height: 72px; padding: 0 16px; text-align: left; font-size: 20px; color: #555555; }h1:before { content: "名稱："; color: #999999; }h1:after { margin-top: 2px; margin-left: 8px; font-size: 13px; font-weight: normal; color: #969696; }h1[data-count]:not([data-count="0"]):after { content: "(" attr(data-count) "個)"; }h1 span { position: absolute; right: 8px; bottom: 4px; }main { min-height: calc(100vh - 72px); margin: 0 auto; padding: 16px; border-top: 1px solid #dedede; *zoom: 1; background-color: #f7f8f9; }main:after { display: table; content: ""; line-height: 0; clear: both; }div { float: left; width: 300px; height: 64px; margin-bottom: 12px; margin-right: 16px; padding: 8px 0; padding-left: 64px; background-color: white; border: 1px solid #e6e6e6; border-bottom: 1px solid #dedede; }div > * { width: calc(100% - 16px); margin: 0 8px; padding: 0 8px; text-align: left; cursor: pointer; -moz-transition: background-color 0.3s; -o-transition: background-color 0.3s; -webkit-transition: background-color 0.3s; transition: background-color 0.3s; }div > *:hover { background-color: #f0f0f0; }div > *:active { background-color: #e6e6e6; }div > *:after { content: ""; top: -100%; height: 100%; color: white; -moz-transition: opacity 0.5s; -o-transition: opacity 0.5s; -webkit-transition: opacity 0.5s; transition: opacity 0.5s; filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=0); opacity: 0; }div > *.ok:after, div > *.no:after { filter: progid:DXImageTransform.Microsoft.Alpha(enabled=false); opacity: 1; }div > *.ok:after { content: "已複製"; background-color: #1dab89; }div > *.no:after { content: "失敗"; background-color: #ea4335; }div:before { content: "?"; width: 64px; height: 64px; line-height: 64px; font-size: 30px; border-right: 1px solid #e6e6e6; }label { font-size: 18px; height: 28px; line-height: 28px; }label:after { font-size: 14px; }span { height: 20px; line-height: 20px; font-size: 13px; color: #969696; text-align: right; }span:before { font-size: 10px; color: #b4b4b4; content: "編碼："; }span.ok:after { background-color: #34b0ab; }</style>' +
        (copyJS ? '<script language="javascript" type="text/javascript">' + copyJS + '</script>' : '') +
      '</head>' +
      '<body>' +
        '<h1 data-count="' + data.length + '">' +
          'icomoon' +
          '<span>Generated by <a href="https://github.com/comdan66/Ginkgo">Ginkgo</a></span>' +
        '</h1>' +
        '<main>' +
          data.map(val => '<div class="' + val[0] + '"><label data-clipboard-text="' + val[1] + '">' + val[1] + '</label><span data-clipboard-text="' + val[2] + '">' + val[2] + '</span></div>').join('') +
        '</main>' +
      '</body>' +
    '</html>'
}
