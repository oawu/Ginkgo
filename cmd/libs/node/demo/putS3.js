/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

// const rq = require;
// const Ginkgo = rq('../Ginkgo');
// const cc = Ginkgo.cc;
// const ln = Ginkgo.ln;
// const pp = Ginkgo.pp;
// const er = Ginkgo.er;
// const su = Ginkgo.su;

// const Exec = rq('child_process').exec;
// const Path = rq('path');
// const root = '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..' + Path.sep;
// const cmdDiv = Path.resolve(__dirname, root + 'cmd') + Path.sep;

// function isJson(str) {
//   try {
//     return JSON.parse(str);
//   } catch (e) {
//     return false;
//   }
// }

// module.exports.run = function(_v, closure) {
//   pp((title = cc('    ➤ ', 'C') + '依據 ' + cc('_dirs.yaml', 'w2') + ' 設定，使用 ' + cc('PHP', 'w2') + ' 上傳至 S3') + cc('… ', 'w0'));

//   const path = Path.resolve(__dirname, cmdDiv + 'libs' + Path.sep + 'php' + Path.sep + 'put.php');
//   const argv = ' --bucket ' + _v.s3Info.bucket + ' --access ' + _v.s3Info.access + ' --secret ' + _v.s3Info.secret + ' --folder ' + _v.s3Info.folder;

//   Exec('php ' + path + argv, function(err, stdout, stderr) {
//     if (err)
//       return (er(title, ['錯誤原因：' + cc(err, 'w2')]) && false) || rq('./rollback').run(_v);

//     if (!stdout.length)
//       return (er(title, ['執行指令 ' + cc('php ' + path + argv, 'w2') + ' 失敗！']) && false) || rq('./rollback').run(_v);

//     stdout = isJson(stdout);

//     if (stdout === false)
//       return (er(title, ['回傳結果 ' + cc('非 Json 格式', 'w2') + '！']) && false) || rq('./rollback').run(_v);

//     if (!stdout.status)
//       return (er(title, ['錯誤原因：' + cc(stdout.message, 'w2')]) && false) || rq('./rollback').run(_v);

//     return su(title) && closure();
//   });
// };



// ==================================================

const rq = require;
const Ginkgo = rq('../Ginkgo');
const Path = rq('path');
const root = '..' + Path.sep + '..' + Path.sep + '..' + Path.sep + '..' + Path.sep;
const FileSystem  = rq('fs');
const rootDiv = Path.resolve(__dirname, root) + Path.sep;
const cmdDiv = Path.resolve(__dirname, root + 'cmd') + Path.sep;
const gitDiv = Path.resolve(__dirname, root + '.git') + Path.sep;
const md5File = rq('md5-file');
const S3 = rq('aws-sdk/clients/s3');
const sepRegExp = new RegExp('^' + Path.sep.replace('/', '\/') + '*|' + Path.sep.replace('/', '\/') + '*$', 'g');
const exts = { jpg: ['image/jpeg', 'image/pjpeg'], gif: ['image/gif'], png: ['image/png', 'image/x-png'], pdf: ['application/pdf', 'application/x-download'], gz: ['application/x-gzip'], zip: ['application/x-zip', 'application/zip', 'application/x-zip-compressed'], swf: ['application/x-shockwave-flash'], tar: ['application/x-tar'], bz: ['application/x-bzip'], bz2: ['application/x-bzip2'], txt: ['text/plain'], html: ['text/html'], htm: ['text/html'], ico: ['image/x-icon'], css: ['text/css'], js: ['application/x-javascript'], xml: ['text/xml'], ogg: ['application/ogg'], wav: ['audio/x-wav', 'audio/wave', 'audio/wav'], avi: ['video/x-msvideo'], mpg: ['video/mpeg'], mov: ['video/quicktime'], mp3: ['audio/mpeg', 'audio/mpg', 'audio/mpeg3', 'audio/mp3'], mpeg: ['video/mpeg'], flv: ['video/x-flv'], php: ['application/x-httpd-php'], bin: ['application/macbinary'], psd: ['application/x-photoshop'], ai: ['application/postscript'], ppt: ['application/powerpoint', 'application/vnd.ms-powerpoint'], wbxml: ['application/wbxml'], tgz: ['application/x-tar', 'application/x-gzip-compressed'], jpeg: ['image/jpeg', 'image/pjpeg'], jpe: ['image/jpeg', 'image/pjpeg'], bmp: ['image/bmp', 'image/x-windows-bmp'], shtml: ['text/html'], text: ['text/plain'], doc: ['application/msword'], docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'], xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'], word: ['application/msword', 'application/octet-stream'], json: ['application/json', 'text/json'], svg: ['image/svg+xml'], mp2: ['audio/mpeg'], exe: ['application/octet-stream', 'application/x-msdownload'], tif: ['image/tiff'], tiff: ['image/tiff'], asc: ['text/plain'], xsl: ['text/xml'], hqx: ['application/mac-binhex40'], cpt: ['application/mac-compactpro'], csv: ['text/x-comma-separated-values', 'text/comma-separated-values', 'application/octet-stream', 'application/vnd.ms-excel', 'application/x-csv', 'text/x-csv', 'text/csv', 'application/csv', 'application/excel', 'application/vnd.msexcel'], dms: ['application/octet-stream'], lha: ['application/octet-stream'], lzh: ['application/octet-stream'], class: ['application/octet-stream'], so: ['application/octet-stream'], sea: ['application/octet-stream'], dll: ['application/octet-stream'], oda: ['application/oda'], eps: ['application/postscript'], ps: ['application/postscript'], smi: ['application/smil'], smil: ['application/smil'], mif: ['application/vnd.mif'], xls: ['application/excel', 'application/vnd.ms-excel', 'application/msexcel'], wmlc: ['application/wmlc'], dcr: ['application/x-director'], dir: ['application/x-director'], dxr: ['application/x-director'], dvi: ['application/x-dvi'], gtar: ['application/x-gtar'], php4: ['application/x-httpd-php'], php3: ['application/x-httpd-php'], phtml: ['application/x-httpd-php'], phps: ['application/x-httpd-php-source'], sit: ['application/x-stuffit'], xhtml: ['application/xhtml+xml'], xht: ['application/xhtml+xml'], mid: ['audio/midi'], midi: ['audio/midi'], mpga: ['audio/mpeg'], aif: ['audio/x-aiff'], aiff: ['audio/x-aiff'], aifc: ['audio/x-aiff'], ram: ['audio/x-pn-realaudio'], rm: ['audio/x-pn-realaudio'], rpm: ['audio/x-pn-realaudio-plugin'], ra: ['audio/x-realaudio'], rv: ['video/vnd.rn-realvideo'], log: ['text/plain', 'text/x-log'], rtx: ['text/richtext'], rtf: ['text/rtf'], mpe: ['video/mpeg'], qt: ['video/quicktime'], movie: ['video/x-sgi-movie'], xl: ['application/excel'], eml: ['message/rfc822']};
const pp = Ginkgo.pp;
const cc = Ginkgo.cc;
const ln = Ginkgo.ln;
const sprintf = rq("sprintf-js").sprintf;

// let progressTitle = null;
// let progressTotal = null;
// let progressindex = null;
const progressInfo = {
  title: null,
  total: 0,
  index: 0,
  present: 0,
};

var mapDir = function(dir, filelist, options) {
  const files = FileSystem.readdirSync(dir);

  filelist = filelist || [];
  files.forEach(function(file) {
    if ([cmdDiv, gitDiv].indexOf(dir + file + Path.sep) !== -1)
      return;

    if (!FileSystem.statSync(dir + file).isDirectory())
      if (
        (!options.includes.length || options.includes.indexOf((dir + file).replace(rootDiv, '')) !== -1) &&
        (!options.formats.length  || options.formats.indexOf('.' + file.split('.').pop().toLowerCase()) !== -1)
      )
        if ((stats = FileSystem.statSync(dir + file)) && (stats.size > 0))
          return filelist.push(dir + file);

    if (FileSystem.statSync(dir + file).isDirectory() && options.recursive)
      filelist = mapDir(dir + file + Path.sep, filelist, options);
  });

  return filelist;
};


var progress = function(total, err) {
  if (typeof total === 'string') {
    if (total === '')
      return pp(progressInfo.title + cc('(' + progressInfo.total + '/' + progressInfo.total + ')', 'w0') + cc(' ─ ', 'w0') + '100%' + cc(' ─ ', 'w0') + cc("完成", 'g') + ln);
    else if (total === '_')
      return pp(progressInfo.title + cc('(' + progressInfo.index + '/' + progressInfo.total + ')', 'w0') + cc(' ─ ', 'w0') + sprintf('%3d%%', progressInfo.present) + cc(' ─ ', 'w0') + cc("失敗", 'r') + ln + (err ? err.map(function(t) {
        return cc('      ◎ ', 'p2') + t + ln;
      }).join('') : '') + ln);
    else
      return pp((progressInfo.title = total) + cc('… ', 'w0'));
  }

  if (!isNaN(total)) {
    progressInfo.total = total;
    progressInfo.index = -1;
  }

  progressInfo.present = progressInfo.total ? Math.ceil((progressInfo.index + 1) * 100) / progressInfo.total : 100;
  progressInfo.present = progressInfo.present <= 100 ? progressInfo.present >= 0 ? progressInfo.present : 0 : 100;

  return pp(progressInfo.title + cc('(' + (++progressInfo.index) + '/' + progressInfo.total + ')', 'w0') + cc(' ─ ', 'w0') + sprintf('%3d%%', progressInfo.present));
};

var localFilesFunc = function(_v, closure) {

  let tmps = _v.dirs.map(function(dir) { return mapDir(dir.path, [], dir); }).reduce(function(a, b) { return a.concat(b); });

  progress(tmps.length);

  tmps = tmps.map(function(dir) {
    progress();

    return {
      name: (_v.s3Info.folder.length ? _v.s3Info.folder + '/' : '') + dir.replace(rootDiv, ''),
      hash: md5File.sync(dir),
      path: dir,
    };
  });

  return progress('') && closure(tmps);
};

var s3FilesFunc = function(_v, closure) {
  s3 = new S3({
    accessKeyId: _v.s3Info.access,
    secretAccessKey: _v.s3Info.secret,
  });

  s3.listObjectsV2({
    Bucket: _v.s3Info.bucket,
    Prefix: _v.s3Info.folder
  }, function(err, data) {
    if (err)
      return progress('_', ['錯誤原因：' + cc(err.message, 'w2')]) && rq('./rollback').run(_v);
    
    progress(data.Contents.length);

    data.Contents = data.Contents.map(function(t) {
      progress();

      return {
        name: t.Key,
        hash: t.ETag.replace(/^('|")(.*)\1/g, '$2'),
      };
    });

    return progress('') && closure(data.Contents);
  });
};

var filterLocalFilesFunc = function(localFiles, s3Files, closure) {
  progress(localFiles.length);

  const tmps = localFiles.filter(function(localFile) {
    progress();
  
    for (let i = 0; i < s3Files.length; i++)
      if (s3Files[i].name == localFile.name && s3Files[i].hash == localFile.hash)
        return false;
  
    return true;
  });

  return progress('') && closure(tmps);
};

var uploadFilesFunc = function(_v, uploadFiles, closure, i) {

  i = typeof i === 'undefined' ? 0 : parseInt(i, 10);

  if (i === 0)
    progress(uploadFiles.length);
  
  if (typeof uploadFiles[i] === 'undefined')
    return progress('') && closure(true);

  progress();

  s3 = new S3({
    accessKeyId: _v.s3Info.access,
    secretAccessKey: _v.s3Info.secret,
  });
  
  s3.putObject({
    Bucket: _v.s3Info.bucket,
    Key: uploadFiles[i].name,
    Body: FileSystem.readFileSync(uploadFiles[i].path),
    ACL: 'public-read',
    ContentType: extensions(uploadFiles[i].path),
    // ContentMD5: Buffer.from(uploadFiles[i].hash).toString('base64'),
    // CacheControl: 'max-age=5'
  }, function(err, data) {
    if (err)
      return progress('_', ['錯誤原因：' + cc(err.message, 'w2')]) && rq('./rollback').run(_v);

    return uploadFilesFunc(_v, uploadFiles, closure, i + 1);
  });
};

var filterS3FilesFunc = function(s3Files, localFiles, closure) {
  progress(s3Files.length);

  const tmps = s3Files.filter(function(s3File) {
    progress();
  
    for (let i = 0; i < localFiles.length; i++)
      if (localFiles[i].name == s3File.name)
        return false;
    
    return true;
  });
  return progress('') && closure(tmps);
};

var deleteFilesFunc = function(_v, deleteFiles, closure, i) {
  i = typeof i === 'undefined' ? 0 : parseInt(i, 10);
  
  if (i === 0)
    progress(deleteFiles.length);

  if (typeof deleteFiles[i] === 'undefined')
    return progress('') && closure(true);
  
  progress();

  s3 = new S3({
    accessKeyId: _v.s3Info.access,
    secretAccessKey: _v.s3Info.secret,
  });

  s3.deleteObject({
    Bucket: _v.s3Info.bucket,
    Key: deleteFiles[i].name,
  }, function(err, data) {
    if (err)
      return progress('_', ['錯誤原因：' + cc(err.message, 'w2')]) && rq('./rollback').run(_v);

    return deleteFilesFunc(_v, deleteFiles, closure, i + 1);
  });
};

var extensions = function(name) {
  return typeof exts[name.split('.').pop().toLowerCase()] === 'undefined' ? 'text/plain' : exts[name.split('.').pop().toLowerCase()][0];
};

var start = function(_v, closure) {
  progress(cc('    ➤ ', 'C') + '整理本機內檔案');
  localFilesFunc(_v, function(localFiles) {
    
    progress(cc('    ➤ ', 'C') + '取得 S3 上檔案');
    s3FilesFunc(_v, function(s3Files) {
      
      progress(cc('    ➤ ', 'C') + '過濾上傳的檔案');
      filterLocalFilesFunc(localFiles, s3Files, function(uploadFiles) {
        
        progress(cc('    ➤ ', 'C') + '上傳檔案至 S3 ');
        uploadFilesFunc(_v, uploadFiles, function(ok) {
          
          progress(cc('    ➤ ', 'C') + '過濾刪除的檔案');
          filterS3FilesFunc(s3Files, localFiles, function(deleteFiles) {
            
            progress(cc('    ➤ ', 'C') + '刪除 S3 的檔案');
            deleteFilesFunc(_v, deleteFiles, closure);
          });
        });
      });
    });
  });
};

module.exports.run = function(_v, closure) {
  pp(ln + cc(' 【讀取設定檔案】', 'y') + ln);

  rq('./dirsInfo').run(_v, function(dirs) {
    pp(ln + cc(' 【上傳至 AWS S3】', 'y') + ln);
    return start(_v, closure);
  });
};
