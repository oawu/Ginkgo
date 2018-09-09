<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

mb_regex_encoding('UTF-8');
mb_internal_encoding('UTF-8');
date_default_timezone_set('Asia/Taipei');

define('PATH_CMD_LIBS_PHP', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('PATH_CMD_LIBS', dirname(PATH_CMD_LIBS_PHP) . DIRECTORY_SEPARATOR);
define('PATH_CMD', dirname(PATH_CMD_LIBS) . DIRECTORY_SEPARATOR);
define('PATH', dirname(PATH_CMD) . DIRECTORY_SEPARATOR);
define('DIRNAME', basename(PATH));

if (!function_exists('params')) { function params($params, $keys) { $ks = $return = $result = []; if (!($params && $keys)) return $return; foreach ($keys as $key) if (is_array($key)) foreach ($key as $k) array_push($ks, $k); else array_push($ks, $key); $key = null; foreach ($params as $param) if (in_array($param, $ks)) if (!isset($result[$key = $param])) $result[$key] = []; else ; else if (isset($result[$key])) array_push($result[$key], $param); else ; foreach ($keys as $key) if (is_array($key)) foreach ($key as $k) if (isset($result[$k])) $return[$key[0]] = isset($return[$key[0]]) ? array_merge($return[$key[0]], $result[$k]) : $result[$k]; else; else if (isset($result[$key])) $return[$key] = isset($return[$key]) ? array_merge($return[$key], $result[$key]) : $result[$key]; else ; return $return; } }
if (!function_exists('arrayFlatten')) { function arrayFlatten($arr) { $new = []; foreach ($arr as $key => $value) if (is_array($value)) $new = array_merge($new, $value); else array_push($new, $value); return $new; } }

try {
  if (!is_readable($dirs = PATH_CMD_LIBS_PHP . 'S3.php'))
    throw new Exception('找不到 cmd/libs/php 目錄內的 S3.php 檔案！');
  
  include $dirs;

  if (!is_readable($dirs = PATH_CMD_LIBS_PHP . 'Spyc.php'))
    throw new Exception('找不到 cmd/libs/php 目錄內的 Spyc.php 檔案！');

  include $dirs;
  
  if (!is_readable($dirs = PATH_CMD . '_dirs.yaml'))
    throw new Exception('找不到 cmd 目錄內的 _dirs.yaml 檔案！');

  $dirs = array_map(function($dir) {
    $dir = array_merge(['formats' => [], 'recursive' => false, 'hidden' => false, 'includes' => []], $dir);
    is_array($dir['formats']) || $dir['formats'] = [];
    is_array($dir['includes']) || $dir['includes'] = [];
    $dir['recursive'] = boolval($dir['recursive']);
    $dir['hidden'] = boolval($dir['hidden']);
    $dir['includes'] = array_map(function($include) { return trim($include, DIRECTORY_SEPARATOR); }, $dir['includes']);

    return $dir;
  }, array_filter(Spyc::YAMLLoad($dirs), function($dir) { return isset($dir['path']) && is_string($dir['path']); }));

  $file = array_shift($argv);
  $argv = params($argv, [['-b', '--bucket'], ['-a', '--access'], ['-s', '--secret'], ['-f', '--folder']]);

  define('BUCKET', empty($argv['-b']) || empty($argv['-b'][0]) ? null : array_shift($argv['-b']));
  define('ACCESS', empty($argv['-a']) || empty($argv['-a'][0]) ? null : array_shift($argv['-a']));
  define('SECRET', empty($argv['-s']) || empty($argv['-s'][0]) ? null : array_shift($argv['-s']));
  define('FOLDER', isset($argv['-f']) ?  isset($argv['-f'][0]) ? array_shift($argv['-f']) : '' : DIRNAME);

  if (BUCKET === null || ACCESS === null || SECRET === null)
    throw new Exception('缺少必填參數！');

  $localFilesFunc = function(array $dirs = []) {
    $mergeArrRec = function($fs, &$rfs, $p = null) use (&$mergeArrRec) {
      if (!($fs && is_array($fs)))
        return false;

      foreach ($fs as $k => $f)
        if (is_array($f))
          $k . $mergeArrRec($f, $rfs, ($p ? rtrim($p, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR : '') . $k);
        else
          array_push($rfs, ($p ? rtrim($p, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR : '') . $f);
    };
    $mapDir = function($sDir, $dDir = 0, $hidden = false, array $formats = [], array $includes = []) use (&$mapDir) {
      if ($fp = @opendir($sDir)) {
        $fs = [];
        $ndDir  = $dDir - 1;
        $sDir = rtrim($sDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

        while (false !== ($f = readdir ($fp))) {
          if (trim($f, '.') == '' || (($hidden === false) && ($f[0] === '.')) || is_link($f) || $f == 'cmd')
            continue;
          if (($dDir < 1 || $ndDir > 0) && @is_dir($sDir . $f))
            $fs[$f] = $mapDir($sDir . $f . DIRECTORY_SEPARATOR, $ndDir, $hidden, $formats, $includes);
          else if (
            (!$includes || in_array(preg_replace('/^' . preg_replace('/\//', '\/', PATH) . '/', '', $sDir . $f), $includes)) &&
            (!$formats  || in_array('.' . pathinfo($f, PATHINFO_EXTENSION), $formats))
          )
            array_push($fs, $f);
          else;
        }
        closedir($fp);

        return $fs;
      }
      return false;
    };

    return array_map(function($file) {
      return [
        'name' => trim(trim(FOLDER, '/') . '/' . preg_replace('/^(' . preg_replace('/\//', '\/', PATH) . ')/', '', $file), '/'),
        'hash' => md5_file($file),
        'path' => $file,
      ];
    }, array_filter(arrayFlatten(array_map(function($dir) use ($mergeArrRec, $mapDir) {
      $files = [];
      $path = trim($dir['path'], DIRECTORY_SEPARATOR);
      $path = PATH . ($path ? $path . DIRECTORY_SEPARATOR : '');
      $mergeArrRec($mapDir($path, $dir['recursive'] ? 0 : 1, $dir['hidden'], $dir['formats'], $dir['includes']), $files, $path);
      return $files;
    }, $dirs)), 'filesize'));
  };

  $s3FilesFunc = function(&$s3) {
    $s3 = new S3(ACCESS, SECRET);
    if (!$s3->test())
      return 'S3 測試失敗！';

    $files = $s3->bucket(BUCKET, FOLDER === '' ? null : FOLDER);

    if ($files === false)
      return 'S3 取得 Bucket 資料失敗！';

    return array_values(array_map(function($file) {
      unset($file['time'], $file['size']);
      return $file;
    }, $files));
  };

  $filterLocalFilesFunc = function(array $localFiles, array $s3Files) {
    return array_filter($localFiles, function($localFile) use ($s3Files) {
      foreach ($s3Files as $s3File)
        if ($s3File['name'] == $localFile['name'] && $s3File['hash'] == $localFile['hash'])
          return false;
      return true;
    });
  };

  $uploadFilesFunc = function($uploadFiles, $s3) {
    return array_filter(array_map(function($uploadFile) use ($s3) {
      return !$s3->putObject($uploadFile['path'], BUCKET, $uploadFile['name']);
    }, $uploadFiles));
  };

  $filterS3FilesFunc = function(array $s3Files, array $localFiles) {
    return array_filter($s3Files, function($s3File) use ($localFiles) {
      foreach ($localFiles as $localFile)
        if ($localFile['name'] == $s3File['name'])
          return false;
      return true;
    });
  };

  $deleteFilesFunc = function(array $deleteFiles, $s3) { return array_filter(array_map(function($deleteFile) use ($s3) { return !$s3->deleteObject(BUCKET, $deleteFile['name']); }, $deleteFiles)); };

  // 整理本機內檔案
  $localFiles = $localFilesFunc($dirs);
  unset($localFilesFunc);

  // 取得 S3 上檔案
  if (is_string($s3Files = $s3FilesFunc($s3)))
    throw new Exception($s3Files);
  unset($s3FilesFunc);

  // 過濾上傳的檔案
  $uploadFiles = $filterLocalFilesFunc($localFiles, $s3Files);
  unset($filterLocalFilesFunc);

  // 上傳檔案至 S3
  if ($uploadFilesFunc($uploadFiles, $s3))
    throw new Exception('S3 上傳失敗！');
  unset($uploadFilesFunc);

  // 過濾刪除的檔案
  $deleteFiles = $filterS3FilesFunc($s3Files, $localFiles);
  unset($filterS3FilesFunc);

  // 刪除 S3 的檔案
  if ($deleteFilesFunc($deleteFiles, $s3))
    throw new Exception('S3 刪除失敗！');
  unset($deleteFilesFunc);

  echo json_encode(['status' => true]);
} catch (Exception $e) {
  echo json_encode(['status' => false, 'message' => $e->getMessage()]);
}
