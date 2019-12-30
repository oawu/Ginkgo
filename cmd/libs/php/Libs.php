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

if (!function_exists('loadLib')) {
  function loadLib($name) {
    return loadFile(PATH_CMD_LIB_PHP . $name . '.php');
  }
}

if (!function_exists('loadVendor')) {
  function loadVendor() {
    if (is_readable($path = PATH_CMD_LIB_PHP . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php'))
      include_once $path;
  }
}

if (!function_exists('argv')) {
  function argv($argv, $keys) {
    $ks = $return = $result = [];

    if (!($argv && $keys))
      return $return;

    foreach ($keys as $key)
      if (is_array($key))
        foreach ($key as $k)
          array_push($ks, $k);
      else
        array_push($ks, $key);

    $key = null;
    
    foreach ($argv as $param)
      if (in_array($param, $ks))
        if (!isset($result[$key = $param]))
          $result[$key] = [];
        else ;
      else if (isset($result[$key]))
        array_push($result[$key], $param);
      else ;

    foreach ($keys as $key)
      if (is_array($key))
        foreach ($key as $k)
          if (isset($result[$k]))
            $return[$key[0]] = isset($return[$key[0]]) ? array_merge($return[$key[0]], $result[$k]) : $result[$k];
          else;
      else if (isset($result[$key]))
        $return[$key] = isset($return[$key]) ? array_merge($return[$key], $result[$key]) : $result[$key];
      else ;
  
    return $return;
  }
}

if (!function_exists('getArgv')) {
  function getArgv($argv, $rules) {
    $argv = argv($argv, $rules);

    foreach ($rules as $rule)
      $argv[$key = array_shift($rule)] ?? [] ?: error('參數錯誤，請給予正確的 ' . $key . ' 參數');

    return $argv;
  }
}

if (!function_exists('defineVAR')) {
  function defineVAR() {
    defined('BASE_URL') ?: define('BASE_URL', '');

    define('CSS_URL',  BASE_URL . 'css/');
    define('JS_URL',   BASE_URL . 'js/');
    define('FONT_URL', BASE_URL . 'font/');

    define('TITLE', 'Ginkgo!');
    define('SEPARATE', ' - ');
  }
}

if (!function_exists('definePATH')) {
  function definePATH() {
    define('PATH_CMD_LIB_PHP', dirname(__FILE__) . DIRECTORY_SEPARATOR);
    define('PATH_CMD_LIB', dirname(PATH_CMD_LIB_PHP) . DIRECTORY_SEPARATOR);
    define('PATH_CMD', dirname(PATH_CMD_LIB) . DIRECTORY_SEPARATOR);
    define('PATH', dirname(PATH_CMD) . DIRECTORY_SEPARATOR);
    define('PATH_ENTRY', PATH . 'src' . DIRECTORY_SEPARATOR);
    define('PATH_JS', PATH_ENTRY . 'js' . DIRECTORY_SEPARATOR);
    define('PATH_CSS', PATH_ENTRY . 'CSS' . DIRECTORY_SEPARATOR);
  }
}

if (!function_exists('arrayFlatten')) {
  function arrayFlatten($arr) {
    $new = [];
    foreach ($arr as $key => $value)
      if (is_array($value))
        $new = array_merge($new, $value);
      else
        array_push($new, $value);
    return $new;
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
    
    if (function_exists('file_get_contents'))
      return @file_get_contents($file);
    
    $fp = @fopen($file, FOPEN_READ);

    if ($fp === false)
      return '';

    flock($fp, LOCK_SH);

    $data = '';

    if (filesize($file) > 0)
      $data =& fread($fp, filesize($file));

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

if (!function_exists('md5Version')) {
  function md5Version($name) {
    return is_readable($t = PATH . $name) ? $name . '?v=' . md5_file($t) : null;
  }
}

set_error_handler('errorHandler');
set_exception_handler('exceptionHandler');
register_shutdown_function('shutdownHandler');
