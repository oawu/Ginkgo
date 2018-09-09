<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2018, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

include_once 'libs' . DIRECTORY_SEPARATOR . 'php' . DIRECTORY_SEPARATOR . 'GinkgoInit.php';

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

include_once 'libs' . DIRECTORY_SEPARATOR . 'php' . DIRECTORY_SEPARATOR . 'Ginkgo.php';
