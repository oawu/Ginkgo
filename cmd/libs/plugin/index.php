<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

mb_regex_encoding('UTF-8');
mb_internal_encoding('UTF-8');
date_default_timezone_set('Asia/Taipei');

include __DIR__ . DIRECTORY_SEPARATOR . '_' . DIRECTORY_SEPARATOR . 'Core.php';

// throw new PluginException('錯誤原因 1');
// throw new PluginException('錯誤原因 1', '錯誤原因 2');
// throw new PluginException(['錯誤原因 1', '錯誤原因 2']);
// throw new PluginException(['錯誤原因 1' => '1', '錯誤原因 2' => '2']);
