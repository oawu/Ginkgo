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

define('LN', "\n");
define('LR', "\r");


define('PATH_CMD_LIBS_PHP_UNITS', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('PATH_CMD_LIBS_PHP', dirname(PATH_CMD_LIBS_PHP_UNITS) . DIRECTORY_SEPARATOR);
define('PATH_CMD_LIBS', dirname(PATH_CMD_LIBS_PHP) . DIRECTORY_SEPARATOR);
define('PATH_CMD', dirname(PATH_CMD_LIBS) . DIRECTORY_SEPARATOR);
define('PATH_TMP', PATH_CMD . 'tmp' . DIRECTORY_SEPARATOR);
define('PATH', dirname(PATH_CMD) . DIRECTORY_SEPARATOR);

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

if (!function_exists('params')) {
  function params($params, $keys) {
    $ks = $return = $result = [];

    if (!($params && $keys))
      return $return;

    foreach ($keys as $key)
      if (is_array($key))
        foreach ($key as $k)
          array_push($ks, $k);
      else
        array_push($ks, $key);

    $key = null;

    foreach ($params as $param)
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


if (!function_exists('fileRead')) {
  function fileRead($file) {
    if (!file_exists($file))
      return false;

    if (function_exists('file_get_contents'))
      return @file_get_contents($file);

    $fp = @fopen($file, FOPEN_READ);
    
    if ($fp === false)
      return false;

    flock($fp, LOCK_SH);

    $data = '';
    if (filesize($file) > 0)
      $data =& fread($fp, filesize($file));

    flock($fp, LOCK_UN);
    fclose($fp);

    return $data;
  }
}

if (!function_exists('fileWrite')) {
  function fileWrite($path, $data, $mode = 'wb') {
    if (function_exists('file_put_contents'))
      return @file_put_contents($path, $data);

    if (!$fp = @fopen($path, $mode))
      return false;

    flock($fp, LOCK_EX);

    for ($result = $written = 0, $length = strlen($data); $written < $length; $written += $result)
      if (($result = fwrite($fp, substr($data, $written))) === false)
        break;

    flock($fp, LOCK_UN);
    fclose($fp);

    return is_int($result);
  }
}