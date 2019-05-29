<?php

class Keyboard {

  private $closure = null;
  private $stdin = null;
  private $running = false;

  public function __construct($closure = null) {

    $this->setStdin()
         ->setClosure($closure);
  }

  public function setStdin($stdin = null) {
    $this->stdin = $stdin ?: fopen('php://stdin', 'r');
    system('stty -icanon -echo');
    stream_set_blocking($this->stdin, 0);
    return $this;
  }

  public function setClosure($closure) {
    $this->closure = $closure;
    return $this;
  }

  private function code() {
    $key = ord(fgetc($this->stdin));

    if (27 === $key) {
      fgetc($this->stdin);
      $key = ord(fgetc($this->stdin));
    }

    return $key;
  }

  public function stop() {
    $this->running = false;
    return $this;
  }

  public function run() {
    $this->running = true;
    while ($this->running) {
      $reads = [$this->stdin];
      $writes = [];
      $except = null;
      if (false !== @stream_select($reads, $writes, $except, null, null))
        is_callable($this->closure)
          && call_user_func($this->closure, $this->code(), $this);
    }

    return $this;
  }

  static public function create() {
    return new self();
  }

  static public function listener($closure) {
    return new self($closure);
  }
}


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
// menu(0);
$i = 0;
Keyboard::listener(function($code, $keyboard) use (&$i) {

  if ($code == 9) {
    if ($i == 0) {
      $i++;
      echo "\033[s\33[1B\33[K create delete\33[u";
    } else if ($i == 1) {
      $i++;
      echo "\033[s\33[1B\33[K \33[41mcreate\33[0m delete\33[u";
    } else if ($i == 2) {
      $i++;
      echo "\033[s\33[1B\33[K create \33[41mdelete\33[0m\33[u";
    } else {
      $i = 1;
      echo "\033[s\33[1B\33[K create delete\33[u";
    }
  }

  // echo $code;
  // $code == 10 && $keyboard->stop();

  // switch ($code) {
  //   case 65: $add = -1; break;
  //   case 66: $add = 1; break;
  //   default: $add = 0; break;
  // }
  // menu($add);
})->run();

echo '您選擇的是「' . menu() . '」';
echo "\n";
echo "\n";

exit(0);
