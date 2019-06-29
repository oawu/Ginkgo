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

system('clear');

function menu($code = 0) {
  static $now = 1, $init;
  

  $items = [
    '123',
    'abc',
  ];

  $top = 2;
  $bottom = 3;


  if (!$init) {
    $init = true;

    echo "string\n";
    echo "string\n";
    foreach ($items as $i => $item)
      echo $item . "\n";
    echo "string\n";
    echo "string\n";
    echo "string\n";
  } else {
    echo "\33[s";
    echo "\33[" . ($bottom + count($items) - ($now - 1)) . "A\33[K" . $items[$now - 1] . "\n";
    echo "\33[u";
    $now += $code;
  }

  $now <= count($items) || $now = 1;
  $now >= 1 || $now = count($items);

  echo "\33[s";
  echo "\33[" . ($bottom + count($items) - ($now - 1)) . "A\33[K-" . $items[$now - 1] . "\n";
  echo "\33[u";
}

menu();

Keyboard::listener(function($code, $keyboard) {

  // echo $code . "\n";

  switch ($code) {
    case 65:
      echo menu(-1);
      break;
    case 66:
      echo menu(1);
      break;

    default:
      break;
  }
})->run();