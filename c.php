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
stream_set_blocking(STDIN, 0);
while (true) {
  // menu($add);

  $code = ord(fgetc(STDIN));

  if (27 === $code) {
    fgetc(STDIN);
    $code = ord(fgetc(STDIN));
  }

echo $code . "\n";

  // // 上:65, 下:66, 左:68, 右:67, enter:10

  // if (!in_array($code, [65, 66, 10]))
  //   $code = null;

  // switch ($code) {
  //   case 65:
  //     $add = -1;
  //     break;
  //   case 66:
  //     $add = 1;
  //     break;
  //   default:
  //     $add = 0;
  //     break;
  // }

  // if ($code == 10)
  //   break;
}

echo '您選擇的是「' . menu() . '」';
echo "\n";
exit(0);