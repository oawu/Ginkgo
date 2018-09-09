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

// define('IS_CLI', );
define('LN', "\n");
define('LR', "\r");

define('PATH_CMD_LIBS_PHP', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('PATH_CMD_LIBS', dirname(PATH_CMD_LIBS_PHP) . DIRECTORY_SEPARATOR);
define('PATH_CMD', dirname(PATH_CMD_LIBS) . DIRECTORY_SEPARATOR);
define('PATH', dirname(PATH_CMD) . DIRECTORY_SEPARATOR);

include_once PATH_CMD_LIBS_PHP . 'GinkgoLib.php';
include_once PATH_CMD_LIBS_PHP . 'GinkgoMinify.php';

$argv = isset($argv) && isCli() ? $argv : ['put.php'];
$file = array_shift($argv);
$argv = params($argv, [
  ['-o', '--output'],
  ['-b', '--bucket'],
  ['-a', '--access'],
  ['-s', '--secret'],
  ['-m', '--minify'],
  ['-f', '--folder'],
  ['-p', '--protocol']
]);

define('OUTPUT',   empty($argv['-o']) || empty($argv['-o'][0]) ? 'cli' : array_shift($argv['-o']));
define('BUCKET',   empty($argv['-b']) || empty($argv['-b'][0]) ?  null : array_shift($argv['-b']));
define('ACCESS',   empty($argv['-a']) || empty($argv['-a'][0]) ?  null : array_shift($argv['-a']));
define('SECRET',   empty($argv['-s']) || empty($argv['-s'][0]) ?  null : array_shift($argv['-s']));
define('MINIFY',   isset($argv['-m']));
define('FOLDER',   isset($argv['-f']));
define('PROTOCOL', isset($argv['-p']));
