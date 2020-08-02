<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2020, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

mb_regex_encoding('UTF-8');
mb_internal_encoding('UTF-8');
date_default_timezone_set('Asia/Taipei');

// 引用 Lib
include_once __DIR__ . DIRECTORY_SEPARATOR . 'Lib.php';

// 取得參數
$argv = getArgv(array_slice($argv, 1), [
  'FILE_PATH'   => ['key' => ['--path', '-P']],
  'ENVIRONMENT' => ['key' => ['--env', '-E'], 'enum' => ['Development', 'Testing', 'Staging', 'Production']],
  'BASE_URL'    => ['key' => ['--base-url', '-B'], 'default' => ''],
]);

// 依環境定義常數
switch (ENVIRONMENT) {
  case 'Development': break;
  case 'Staging': break;
  case 'Testing': break;
  case 'Production': break;
}

// 定義路徑常數
define('PATH_PHP', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('PATH_LIB', dirname(PATH_PHP) . DIRECTORY_SEPARATOR);
define('PATH_CMD', dirname(PATH_LIB) . DIRECTORY_SEPARATOR);
define('PATH',     dirname(PATH_CMD) . DIRECTORY_SEPARATOR);
define('PATH_ENTRY',     PATH . (in_array(ENVIRONMENT, ['Staging', 'Production']) ? 'dist' : 'src') . DIRECTORY_SEPARATOR);
define('PATH_ENTRY_JS',  PATH_ENTRY . 'js' . DIRECTORY_SEPARATOR);
define('PATH_ENTRY_CSS', PATH_ENTRY . 'CSS' . DIRECTORY_SEPARATOR);

// 定義網址常數
define('URL_CSS',  BASE_URL . 'css/');
define('URL_JS',   BASE_URL . 'js/');
define('URL_ICON', BASE_URL . 'icon/');

// 載入其他常數
load('Define');

load('HTML');
load('Asset');
loadVendor();

loadFile(FILE_PATH);
