<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2020, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

/* --------------------------------------------------
 *  定義自己的 Error Handler
 * -------------------------------------------------- */

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

if (!function_exists('getNamespaces')) {
  function getNamespaces($className) {
    return array_slice(explode('\\', $className), 0, -1);
  }
}

if (!function_exists('deNamespace')) {
  function deNamespace($className) {
    $className = array_slice(explode('\\', $className), -1);
    return array_shift($className);
  }
}

if (!function_exists('error')) {
  function error($message) {
    throw new Exception($message);
    exit(1);
  }
}

if (!function_exists('loadFile')) {
  function loadFile($file) {
    is_readable($file) || error('載入 ' . $file . ' 失敗！');
    include_once $file;
  }
}

if (!function_exists('load')) {
  function load($name) {
    return loadFile(PATH_PHP . $name . '.php');
  }
}

if (!function_exists('loadVendor')) {
  function loadVendor() {
    if (is_readable($path = PATH_PHP . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php'))
      include_once $path;
  }
}

if (!function_exists('getArgv')) {
  function getArgv($argvs, $rules) {
    $results = [];
    foreach ($rules as $name => $rule)
      foreach ($argvs as $i => $argv)
        in_array($argv, $rule['key']) && $results[$name] = isset($argvs[$i + 1]) && $argvs[$i + 1][0] != '-' ? $argvs[$i + 1] : '';

    foreach ($rules as $name => $rule)
      isset($results[$name])
        ? isset($rule['enum']) && $rule['enum'] && is_array($rule['enum']) ? define($name, in_array($results[$name], $rule['enum']) ? $results[$name] : error('參數錯誤，請給予正確的 ' . $name . '(' . implode(', ', $rule['key']) . ') 參數，您給予「' . $results[$name] . '」不再允許選項中！')) : define($name, $results[$name])
        : define($name, $rule['default'] ?? error('參數錯誤，請給予正確的 ' . $name . '(' . implode(', ', $rule['key']) . ') 參數'));

    return $results;
  }
}

if (!function_exists('attr')) {
  function attr($attrs, $excludes = [], $symbol = '"') {
    $attrs = array_filter($attrs, function($attr) { return $attr !== null; });

    is_string($excludes) && $excludes = [$excludes];
    if ($excludes)
      foreach ($attrs as $key => $value)
        if (in_array($key, $excludes))
          unset($attrs[$key]);

    $attrs = array_map(function($k, $v) use ($symbol) { return is_bool($v) ? $v === true ? $k : '' : ($k . '=' . $symbol . $v . $symbol); }, array_keys($attrs), array_values($attrs));
    return $attrs ? ' ' . implode(' ', $attrs) : '';
  }
}

if (!function_exists('fileRead')) {
  function fileRead($file) {
    if (!file_exists($file))
      return '';

    $fp = @fopen($file, 'rb');

    if ($fp === false)
      return '';

    flock($fp, LOCK_SH);

    $data = '';

    if (filesize($file) > 0)
      $data .= fread($fp, filesize($file));

    flock($fp, LOCK_UN);
    fclose($fp);

    return $data;
  }
}

if (!function_exists('pathReplace')) {
  function pathReplace($search, $subject, $replace = '') {
    return preg_replace('/^(' . preg_replace('/\//', '\/', $search) . ')/', $replace, $subject);
  }
}

set_error_handler('errorHandler');
set_exception_handler('exceptionHandler');
register_shutdown_function('shutdownHandler');
