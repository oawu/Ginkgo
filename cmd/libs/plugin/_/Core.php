<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

/* --------------------------------------------------
 *  定義自己的 Error Handler
 * -------------------------------------------------- */

class PluginException extends Exception {
  public function __construct() {
    $args = func_get_args();

    if (count($args) > 1)
      parent::__construct(json_encode($args));
    else
      parent::__construct(is_array($args = array_shift($args)) ? json_encode($args) : $args);
  }
}

if (!function_exists('errorHandler')) {
  function errorHandler($severity, $message, $filepath, $line) {
    // 一般錯誤，例如 1/0; 這種錯誤！
    echo '檔案：' . $filepath . '(' . $line . ')，錯誤原因：' . $message;
    exit(1);
  }
}

if (!function_exists('exceptionHandler')) {
  function exceptionHandler($exception) {
    echo $exception->getMessage();
    exit(1);
  }
}

if (!function_exists('shutdownHandler')) {
  function shutdownHandler() {
    // 長時間沒反應過來的，例如：while(1) {}
    if ($lastError = error_get_last()) {
      echo $lastError;
      exit(1);
    }
    exit(0);
  }
}

set_error_handler('errorHandler');
set_exception_handler('exceptionHandler');
register_shutdown_function('shutdownHandler');
