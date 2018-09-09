<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

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