<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

if (!function_exists('cc')) {
  function cc($str, $fontColor = null, $backgroundColor = null, $options = []) {
    if ($str === "")
      return "";

    $colors = ['n' => '30', 'r' => '31', 'g' => '32', 'y' => '33', 'b' => '34', 'p' => '35', 'c' => '36', 'w' => '37'];
    $styles = ['underline' => '4', 'blink' => '5', 'reverse' => '7', 'hidden' => '8',
               'u' => '4',         'b' => '5',     'r' => '7',       'h' => '8'];

    $tmps = [];

    is_array($options) || $options = array_filter(array_map('trim', explode(',', $options)));

    if ($options = array_map('strtolower', $options))
      foreach ($options as $style)
        isset($styles[$style]) && array_push($tmps, ["\033[" . $styles[$style] . "m", "\033[0m"]);

    if ($backgroundColor !== null) {
      $c = $backgroundColor[0];
      $c = strtolower($c);
      isset($colors[$c]) && array_push($tmps, ["\033[" . ($colors[$c] + 10) . "m", "\033[0m"]);
    }

    if ($fontColor !== null) {
      strlen($fontColor) > 1 || $fontColor .= '_';
      list($c, $w) = str_split($fontColor);

      $w = $w === '_' ? ctype_upper($c) ? '2' : $w : $w;
      $c = strtolower($c);

      in_array($w, ['0', '1', '2']) || $w = '1';
      $w = $w !== '0' ? $w === '1' ? '0' : '1' : '2';

      isset($colors[$c]) && array_push($tmps, ["\033[" . $w . ';' . $colors[$c] . "m", "\033[0m"]);
    }

    foreach ($tmps as $tmp)
      $str = $tmp[0] . $str . $tmp[1];

    return $str;
  }
}

if (!function_exists('isCli')) {
  function isCli() {
    return php_sapi_name() === 'cli' || PHP_SAPI === 'cli' || defined('STDIN');
  }
}

if (!function_exists('error')) {
  function error(Exception $e) {
    if (!isCli() || OUTPUT === 'json') {
      responseStatusHeader(400);
      @header('Content-Type: application/json; charset=UTF-8', true);

      echo json_encode([
          'messages' => [$e->getMessage()],
          'logs' => Log::get()
        ]);
    } else {
      echo '<meta http-equiv="Content-type" content="text/html; charset=utf-8" /><pre>';
      var_dump(1);
      exit();
    }
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

// https://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81
if (!function_exists('responseStatusText')) {
  function responseStatusText ($code) {
    $responseStatusText = [
      100 => 'Continue', 101 => 'Switching Protocols', 102 => 'Processing',
      200 => 'OK', 201 => 'Created', 202 => 'Accepted', 203 => 'Non-Authoritative Information', 204 => 'No Content', 205 => 'Reset Content', 206 => 'Partial Content', 207 => 'Multi-Status', 208 => 'Already Reported', 226 => 'IM Used',
      300 => 'Multiple Choices', 301 => 'Moved Permanently', 302 => 'Found', 303 => 'See Other', 304 => 'Not Modified', 305 => 'Use Proxy', 306 => 'Switch Proxy', 307 => 'Temporary Redirect', 308 => 'Permanent Redirect',
      400 => 'Bad Request', 401 => 'Unauthorized', 402 => 'Payment Required', 403 => 'Forbidden', 404 => 'Not Found', 405 => 'Method Not Allowed', 406 => 'Not Acceptable', 407 => 'Proxy Authentication Required', 408 => 'Request Timeout', 409 => 'Conflict', 410 => 'Gone', 411 => 'Length Required', 412 => 'Precondition Failed', 413 => 'Request Entity Too Large', 414 => 'Request-URI Too Long', 415 => 'Unsupported Media Type', 416 => 'Requested Range Not Satisfiable', 417 => 'Expectation Failed', 418 => 'I\'m a teapot', 420 => 'Enhance Your Caim', 421 => 'Misdirected Request', 422 => 'Unprocessable Entity', 423 => 'Locked', 424 => 'Failed Dependency', 425 => 'Unodered Cellection', 426 => 'Upgrade Required', 428 => 'Precondition Required', 429 => 'Too Many Requests', 431 => 'Request Header Fields Too Large', 444 => 'No Response', 450 => 'Blocked by Windows Parental Controls', 451 => 'Unavailable For Legal Reasons', 494 => 'Request Header Too Large',
      500 => 'Internal Server Error', 501 => 'Not Implemented', 502 => 'Bad Gateway', 503 => 'Service Unavailable', 504 => 'Gateway Timeout', 505 => 'HTTP Version Not Supported', 506 => 'Variant Also Negotiates', 507 => 'Insufficient Storage', 508 => 'Loop Detected', 510 => 'Not Extended', 511 => 'Network Authentication Required'
    ];

    return isset($responseStatusText[$code]) ? $responseStatusText[$code] : '';
  }
}

if (!function_exists('responseStatusHeader')) {
  function responseStatusHeader($code, $str = '') {
    if (isCli())
      return ;

    $str = responseStatusText($code);
    $str || $str = responseStatusText($code = 500);

    if (strpos(PHP_SAPI, 'cgi') === 0)
      return header('Status: ' . $code . ' ' . $str, true);

    in_array(($protocol = isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.1'), ['HTTP/1.0', 'HTTP/1.1', 'HTTP/2']) || $protocol = 'HTTP/1.1';
    return header($protocol . ' ' . $code . ' ' . $str, true, $code);
  }
}

class Log {
  public static function display($str) {
    if (!isCli() || OUTPUT === 'json') {
    } else {
      echo LR . cc('    ➤ ', 'c2') . $str;
    }
  }
}

class Select {
  private $dir = null, $formats = [], $includes = [], $recursive = true, $hidden = false;

  private static $dirs = [];
  
  public function __construct() {
    $this->dir = null;
    $this->formats = [];
    $this->includes = [];
    $this->recursive = true;
    $this->hidden = false;
  }

  public static function dirs() {
    return array_values(array_filter(self::$dirs, function($dir) {
      return $dir->getDir() !== null;
    }));
  }

  public static function create() {
    array_push(self::$dirs, $tmp = new static());
    return $tmp;
  }

  public function getDir() {
    return $this->dir;
  }

  public function getFormats() {
    return $this->formats;
  }

  public function getRecursive() {
    return $this->recursive;
  }

  public function getIncludes() {
    return $this->includes;
  }

  public function getHidden() {
    return $this->hidden;
  }

  public function dir($dir) {
    $this->dir = PATH . trim($dir, DIRECTORY_SEPARATOR);
    return $this;
  }

  public function formats($formats = []) {
    $this->formats = arrayFlatten(func_get_args());
    return $this;
  }

  public function includes($includes = []) {
    $this->includes = arrayFlatten(func_get_args());
    return $this;
  }

  public function recursive($recursive = true) {
    $this->recursive = $recursive;
    return $this;
  }

  public function hidden($hidden = false) {
    $this->hidden = $hidden;
    return $this;
  }
}

// class Log {
//   private $title = null, $message = null;
//   private static $logs = [];

//   public static function create() {
//     array_push(self::$logs, $tmp = new static());
//     return $tmp;
//   }

//   public static function info($message) {
//     $tmp = static::create()->message($message);
//     IS_CLI && print($tmp . LN);
//     return $tmp;
//   }

//   public static function error($message) {
//     $tmp = static::create()->title('錯誤！')->message($message);
//     IS_CLI && print($tmp . LN);

//     return $tmp;
//   }

//   public function __construct() {
//     $this->title = null;
//   }

//   public function __toString() {
//     if (!($this->message !== null && is_string($this->message) && strlen($this->message)))
//       return '';

//     $title = isset($this->title) ? cc($this->title, 'r') : '';
//     $message = $this->message;

//     return '   ' . $title . '' . $message;
//   }
//   public function message($message) {
//     $this->message = $message;
//     return $this;
//   }
//   public function title($title) {
//     $this->title = $title;
//     return $this;
//   }
// }









if (!function_exists('progress')) {
  function progress($c = null) {
    static $title;
    static $index;
    static $total;

    if (is_string($c))
      return $c === '' || $c === '_' ? $title . cc('(' . number_format($total) . '/' . number_format($total) . ')', 'w0') . cc(' ─ ', 'N') . sprintf('% 3d%%', 100) . cc(' ─ ', 'N') . ($c === '_' ? cc("失敗", 'r') : cc("完成", 'g')) . "\n" : $title = "\r" . $c;

    if (is_numeric($c)) {
      $total = $c;
      $index = -1;
    }

    $present = $total ? ceil(($index + 1) * 100) / $total : 100;
    $present = $present <= 100 ? $present >= 0 ? $present : 0 : 100;

    return $title . cc('(' . number_format(++$index) . '/' . number_format($total) . ')', 'w0') . cc(' ─ ', 'N') . sprintf('% 3d%%', $present);
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

function mergeArrRec($fs, &$rfs, $p = null) {
  if (!($fs && is_array($fs)))
    return false;

  foreach ($fs as $k => $f)
    if (is_array($f))
      $k . mergeArrRec($f, $rfs, ($p ? rtrim($p, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR : '') . $k);
    else
      array_push($rfs, ($p ? rtrim($p, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR : '') . $f);
}

function mapDir($sDir, $dDir = 0, $hidden = false, array $formats = [], array $includes = []) {
  if ($fp = @opendir($sDir)) {
    $fs = [];
    $ndDir  = $dDir - 1;
    $sDir = rtrim($sDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

    while (false !== ($f = readdir($fp))) {
      if (trim($f, '.') == '' || (($hidden === false) && ($f[0] === '.')) || is_link($f) || $f == 'cmd')
        continue;
      if (($dDir < 1 || $ndDir > 0) && @is_dir($sDir . $f))
        $fs[$f] = mapDir($sDir . $f . DIRECTORY_SEPARATOR, $ndDir, $hidden, $formats, $includes);
      else if (($includes && in_array(pathinfo($f, PATHINFO_BASENAME), $includes)) || ($formats && in_array(pathinfo($f, PATHINFO_EXTENSION), $formats)))
        array_push($fs, $f);
      else;
    }
    closedir($fp);

    return $fs;
  }
  return false;
}

function localFilesFunc($title) {
  echo progress($title) . cc('… ', 'w0');

  $files = arrayFlatten(array_map(function($dir) {
    $files = [];
    mergeArrRec(mapDir($dir->getDir(), $dir->getRecursive() ? 0 : 1, $dir->getHidden(), $dir->getFormats(), $dir->getIncludes()), $files, $dir->getDir());
    return $files;
  }, Select::dirs()));
  

  echo progress(count($files));

  $files = array_map(function($file) {
    $format = pathinfo($file, PATHINFO_EXTENSION);
    $content = fileRead($file);

    if (MINIFY) {
      $bom = pack('H*','EFBBBF');

      switch ($format) {
        case 'html': $content = preg_replace("/^$bom/", '', GinkgoMinify::html($content)); break;
        case 'css': $content = preg_replace("/^$bom/", '', GinkgoMinify::css($content)); break;
        case 'js': $content = preg_replace("/^$bom/", '', GinkgoMinify::js($content)); break;
        // case 'json': $content = preg_replace("/^$bom/", '', GinkgoMinify::json($content)); break;
      }
    }
    
    $newPath = PATH_TMP . md5(uniqid(mt_rand(), true)) . ($format ? '.' . $format : '');
    fileWrite($newPath, $content, 'wb');
    unset($content);

    echo progress();

    return [
      'name' => trim(trim(config('apiDoc', 'folder'), '/') . '/' . preg_replace('/^(' . preg_replace('/\//', '\/', PATH_DOC) . ')/', '', $file), '/'),
      'hash' => md5_file($newPath),
      'path' => $newPath,
    ];
  }, $files);
  exit();

  echo progress('');
  return $files;
};