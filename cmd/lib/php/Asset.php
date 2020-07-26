<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

namespace HTML {
  class Asset {
    private $cssPaths = [];
    private $jsPaths = [];

    public function __construct() {}

    public function css($path) {
      if (preg_match('/^https?:\/\/.*/ui', $path)) {
        $this->cssPaths[$path] = true;
        return $this;
      }
      $path = realpath(PATH_ENTRY_CSS . str_replace('/', DIRECTORY_SEPARATOR, $path));
      if (!($path !== false && pathinfo($path, PATHINFO_EXTENSION) == 'css' && is_readable($path))) return $this;
      $this->cssPaths[URL_CSS . pathReplace(PATH_ENTRY_CSS, $path)] = $path;
      return $this;
    }

    public function js($path) {
      if (preg_match('/^https?:\/\/.*/ui', $path)) {
        $this->jsPaths[$path] = true;
        return $this;
      }
      $path = realpath(PATH_ENTRY_JS . str_replace('/', DIRECTORY_SEPARATOR, $path));
      if (!($path !== false && pathinfo($path, PATHINFO_EXTENSION) == 'js' && is_readable($path))) return $this;
      $this->jsPaths[URL_JS . pathReplace(PATH_ENTRY_JS, $path)] = $path;
      return $this;
    }

    public function __toString() {
      $strs = [];
      $prev = [
        \HTML\Script("window.ENV = '" . ENVIRONMENT . "';")->type('text/javascript')
      ];
      
      if (in_array(ENVIRONMENT, ['Development', 'Testing'])) {
        $css = array_values(
          array_filter(
            array_map(function($path) {
              return !is_string($path)
                ? is_array($path)
                  ? implode("\n", array_map(function($src, $file) {
                      return \HTML\Link()->type('text/css')->rel('stylesheet')->href($src . '?v=' . md5_file($file));
                    }, array_keys($path), array_values($path)))
                  : null
                : \HTML\Link()->type('text/css')->rel('stylesheet')->href($path); },
            self::merge($this->cssPaths))));

        $js = array_values(
          array_filter(
            array_map(function($path) {
              return !is_string($path)
                ? is_array($path)
                  ? implode("\n", array_map(function($src, $file) {
                      return \HTML\Script()->type('text/javascript')->language('javascript')->src($src . '?v=' . md5_file($file));
                    }, array_keys($path), array_values($path)))
                  : null
                : \HTML\Script()->type('text/javascript')->language('javascript')->src($path);
            },
            self::merge($this->jsPaths))));
        
        array_push($strs, "\n");
        $prev && array_push($strs, ...$prev, ...['']);
        $css && array_push($strs, ...$css, ...['']);
        $js && array_push($strs, ...$js, ...['']);
        array_push($strs, "");
        return implode("\n", $strs);
      }

      $css = implode('',
        array_values(
          array_filter(
            array_map(function($path) {
              return !is_string($path)
                ? is_array($path)
                  ? \HTML\Style(...array_map(function($src, $file) {
                      return preg_replace("/^" . pack('H*','EFBBBF') . "/", '',
                            preg_replace("/url\(\'?\.\.\/icon\//", "url(" . URL_ICON,
                              fileRead($file)));
                    }, array_keys($path), array_values($path))
                  )->type('text/css')
                  : null
                : \HTML\Link()->type('text/css')->rel('stylesheet')->href($path);
              }, self::merge($this->cssPaths)))));
      
      $prev = implode('', array_map(function($prev) { return $prev->text(); }, $prev));

      $js = implode("\n",
        array_values(
          array_filter(
            array_map(function($path) use ($prev) {
              return !is_string($path)
                ? is_array($path)
                  ? \HTML\Script($prev . "\n" . implode("\n", array_map(function($src, $file) {
                      return preg_replace("/^" . pack('H*','EFBBBF') . "/", '', fileRead($file));
                    }, array_keys($path), array_values($path))))->type('text/javascript')
                  : null
                : \HTML\Script()->type('text/javascript')->language('javascript')->src($path);
            }, self::merge($this->jsPaths)))));

      $css && array_push($strs, $css, $js);
      return implode("", $strs);
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
  function Asset() {
    return Asset::create();
  }
}
