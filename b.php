<?php

function menu($add = null) {
  static $now = 1;

  if ($add === null)
    return $now;

  system('clear');
  
  $range = [1, 2];
  $now += $add;

  $now <= 2 || $now = 1;
  $now >= 1 || $now = 2;

  echo "=========================\n";
  echo " 請選擇以下選項\n";
  echo "=========================\n";
  echo ($now == 1 ? '->' : '  ') . " 1. 選項A\n";
  echo ($now == 2 ? '->' : '  ') . " 2. 選項B\n";
  echo "-------------------------\n";
  echo " 請案上、下鍵選擇項目，\n";
  echo " 確定後按 Enter 即可！\n";
  echo "=========================\n";
  echo "\n";
}

system('stty -icanon -echo');

$add = 0;
while (true) {
  menu($add);

  $code = ord(fgetc(STDIN));

  if (27 === $code) {
    fgetc(STDIN);
    $code = ord(fgetc(STDIN));
  }

  // 上:65, 下:66, 左:68, 右:67, enter:10

  if (!in_array($code, [65, 66, 10]))
    continue;

  switch ($code) {
    case 65:
      $add = -1;
      break;
    case 66:
      $add = 1;
      break;
  }

  if ($code == 10)
    break;
}

echo '您選擇的是「' . menu() . '」';
echo "\n";
exit(0);

// strtolower(trim(fgets(STDIN)))

// while (fgetc(STDIN)) {
//   $key = ord(fgetc($stdin));

//   if (27 === $key) {
//     fgetc($stdin);
//     $key = ord(fgetc($stdin));
//   }
//   var_dump($key);
// };


// require_once __DIR__ . '/vendor/autoload.php';
// system('stty -icanon -echo');

// $loop = React\EventLoop\Factory::create();

// $stdin = fopen('php://stdin', 'r');
// stream_set_blocking($stdin, 0);

// while (fgetc($stdin));

// $loop->addReadStream($stdin, function ($stdin) {
//   $key = ord(fgetc($stdin));

//   if (27 === $key) {
//     fgetc($stdin);
//     $key = ord(fgetc($stdin));
//   }

//   echo $key;

//   switch ($key) {
//     case 0: case ord(''): exit(0); break;
//   }
// });
// $loop->run();





// $name = strtolower(trim(fgetc(STDIN)));
// $input = fgetc(STDIN);
// $input = readline('Input: ');
// // $_command = readline("\033[32m PHP> \033[35m");

// echo '<meta http-equiv="Content-type" content="text/html; charset=utf-8" /><pre>';
// var_dump($_command);
// exit();

// do {

//   if ($name || () {
//     echo cliColor('  ➜ ', 'R') . '檔名「' . cliColor($name, 'W') . '」是否正確' . cliColor('[y：沒錯, n：不是]', 'w0') . '：';
    
//     $check = strtolower(trim(fgets(STDIN)));
//     $check == 'n'
//       && $name = '';
//   }
// } while ($check != 'y');


// echo "\033[?25l \033[0m";
// echo "\33[?25h";