<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

// if (BUCKET === null || ACCESS === null || SECRET === null) {
//   Log::error('缺少必填參數！');
// }

// echo '<meta http-equiv="Content-type" content="text/html; charset=utf-8" /><pre>';
// var_dump(1);
// exit();

// Log::info('缺少必填參數！');
// Log::error('缺少必填參數！');

try {
  if (BUCKET === null || ACCESS === null || SECRET === null)
    throw new Exception('缺少必填參數！');


  // echo "\n";
  // echo cc(' 【檔案處理】', 'y') . "\n";
  $localFiles = localFilesFunc(cc('    ➤ ', 'c2') . "整理本機內檔案");

  // Log::display('列出本機內檔案');
  // Log::display('列出本機內檔案' . cc('… ', 'w0'));
  // x

  // Log::display('列出本機內檔案', function() {

  // });


} catch (Exception $e) {
  error($e);
}

