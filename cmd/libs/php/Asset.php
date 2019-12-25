<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

class Asset {
  private $cssPaths = [];
  private $jsPaths = [];

  public function __construct() {}

  public function appendCSS(string $path) {
    if (preg_match('/^https?:\/\/.*/ui', $path)) return $this->cssPaths[$path] = true;
    $path = realpath(PATH_CSS . str_replace('/', DIRECTORY_SEPARATOR, $path));
    if (!($path !== false && pathinfo($path, PATHINFO_EXTENSION) == 'css' && is_readable($path))) return $this;
    $this->cssPaths[CSS_URL . pathReplace(PATH_CSS, $path)] = $path;
    return $this;
  }

  public function appendJS(string $path) {
    if (preg_match('/^https?:\/\/.*/ui', $path)) return $this->jsPaths[$path] = true;
    $path = realpath(PATH_JS . str_replace('/', DIRECTORY_SEPARATOR, $path));
    if (!($path !== false && pathinfo($path, PATHINFO_EXTENSION) == 'js' && is_readable($path))) return $this;
    $this->jsPaths[JS_URL . pathReplace(PATH_JS, $path)] = $path;
    return $this;
  }

  public function appendVueComponent(string $name) {
    if ($name = trim($name, '/'))
      return $this->appendCSS('component/' . $name . '.css')->appendJS('component/' . $name . '.js');
    else
      return $this;
  }

  public function __toString() {
    $str = '';
    
    $str .= in_array(ENVIRONMENT, ['Development', 'Testing'])
      ? "\n\n" . implode("\n", array_values(array_filter(array_map(function($path) { return !is_string($path) ? is_array($path) ? implode("\n", array_map(function($src, $file) { return \HTML\Link()->type('text/css')->rel('stylesheet')->href($src . '?v=' . md5_file($file)); }, array_keys($path), array_values($path))) : null : \HTML\Link()->type('text/css')->rel('stylesheet')->href($path); }, self::merge($this->cssPaths))))) . "\n\n"
      : implode('', array_values(array_filter(array_map(function($path) { return !is_string($path) ? is_array($path) ? \HTML\Style((new \MatthiasMullie\Minify\CSS())->add(implode('', array_map(function($src, $file) { return preg_replace("/^" . pack('H*','EFBBBF') . "/", '', preg_replace("/\n/", '', preg_replace('/url\s*\(\'(\.\.\/)*font\//', "url('" . FONT_URL, fileRead($file)))); }, array_keys($path), array_values($path))))->minify())->type('text/css') : null : \HTML\Link()->type('text/css')->rel('stylesheet')->href($path); }, self::merge($this->cssPaths)))));

    $js = ["window.URL = { base (t) { return '" . BASE_URL . "' + t.trim('/') }, js (t) { return '" . JS_URL . "' + t.trim('/') }, css (t) { return '" . CSS_URL . "' + t.trim('/') }, };"];

    $str .= in_array(ENVIRONMENT, ['Development', 'Testing'])
      ? "\n\n" . \HTML\Script(array_shift($js))->type('text/javascript') . "\n" . implode("\n", array_values(array_filter(array_map(function($path) { return !is_string($path) ? is_array($path) ? implode("\n", array_map(function($src, $file) { return \HTML\Script()->type('text/javascript')->language('javascript')->src($src . '?v=' . md5_file($file)); }, array_keys($path), array_values($path))) : null : \HTML\Script()->type('text/javascript')->language('javascript')->src($path); }, self::merge($this->jsPaths))))) . (ENVIRONMENT == 'Development' ? "\n" . \HTML\Script()->src('/socket.io/socket.io.js')->type('text/javascript') . "\n" . \HTML\Script("io.connect().on('action', data => data === 'reload' && location.reload(true));")->type('text/javascript') : '') . "\n\n"
      : implode('', array_values(array_filter(array_map(function($path) use (&$js) { return !is_string($path) ? is_array($path) ? \HTML\Script((new \MatthiasMullie\Minify\JS())->add(preg_replace('/\/\*\*((\r\n|\n) \*[^\n]*)+(\r\n|\n) \*\//', '', implode('', array_map(function($src, $file) use (&$js) { return array_shift($js) . preg_replace("/^" . pack('H*','EFBBBF') . "/", '', fileRead($file)); }, array_keys($path), array_values($path)))))->minify())->type('text/javascript') : null : \HTML\Script()->type('text/javascript')->language('javascript')->src($path); }, self::merge($this->jsPaths)))));

    return $str;
  }

  private static function merge($tmps) {
    $paths = [];

    foreach (array_filter($tmps) as $src => $tmp)
      if (is_string($tmp) && isset($paths[count($paths) - 1]) && is_array($paths[count($paths) - 1]))
        $paths[count($paths) - 1][$src] = $tmp;
      else if (is_string($tmp))
        array_push($paths, [$src => $tmp]);
      else
        array_push($paths, $src);

    return $paths;
  }

  public static function create() {
    return new static();
  }
}