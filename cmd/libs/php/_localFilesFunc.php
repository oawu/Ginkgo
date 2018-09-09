<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

include_once 'units' . DIRECTORY_SEPARATOR . 'base.php';
include_once PATH_CMD_LIBS_PHP_UNITS . 'Select.php';
include_once PATH_CMD_LIBS_PHP_UNITS . 'localFilesFunc.php';

if (defined('FROM_PUT')) {
  return json_encode(localFilesFunc(Select::dirs(), 'a'));
} else {
  Select::create()
    ->dir('')
    ->formats('html', 'txt')
    ->recursive(false)
    ->hidden(false);

  Select::create()
    ->dir('js')
    ->formats('js')
    ->recursive(true)
    ->hidden(false);

  Select::create()
    ->dir('css')
    ->formats('css')
    ->recursive(true)
    ->hidden(false);

  Select::create()
    ->dir('font')
    ->formats('eot', 'svg', 'ttf', 'woff')
    ->recursive(true)
    ->hidden(false);

  Select::create()
    ->dir('img')
    ->formats('png', 'jpg', 'jpeg', 'gif', 'svg')
    ->recursive(true)
    ->hidden(false);

  echo json_encode(localFilesFunc(Select::dirs(), 'a'));
}
