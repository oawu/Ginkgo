<?php

class Xterm {
  const BLACK  = 0;
  const RED    = 1;
  const GREEN  = 2;
  const YELLOW = 3;
  const BLUE   = 4;
  const PURPLE = 5;
  const CYAN   = 6;
  const GRAY   = 7;

  const L_BLACK  = 8;
  const L_RED    = 9;
  const L_GREEN  = 10;
  const L_YELLOW = 11;
  const L_BLUE   = 12;
  const L_PURPLE = 13;
  const L_CYAN   = 14;
  const L_GRAY   = 15;
  
  private $fCode, $bCode;
  private $blod, $italic, $underline, $dim, $blink, $inverted, $hidden;

  public function color($code) { $this->fCode = $code; return $this; }
  public function background($code) { $this->bCode = $code; return $this; }
  public function blod($blod = true) { $this->blod = $blod; return $this; }
  public function dim($dim = true) { $this->dim = $dim; return $this; }
  public function italic($italic = true) { $this->italic = $italic; return $this; }
  public function underline($underline = true) { $this->underline = $underline; return $this; }
  public function blink($blink = true) { $this->blink = $blink; return $this; }
  public function inverted($inverted = true) { $this->inverted = $inverted; return $this; }
  public function hidden($hidden = true) { $this->hidden = $hidden; return $this; }

  public function str($str) {
    $codes = [];
    $this->fCode > -1 && $this->fCode < 256 && array_push($codes, "\033[38;5;" . $this->fCode . "m");
    $this->bCode > -1 && $this->bCode < 256 && array_push($codes, "\033[48;5;" . $this->bCode . "m");
    foreach (['blod' => 1, 'dim' => 2, 'italic' => 3, 'underline' => 4, 'blink' => 5, 'inverted' => 7, 'hidden' => 8] as $key => $val)
      isset($this->$key) && is_bool($this->$key) && $this->$key && array_push($codes, "\033[" . $val . "m");
    foreach ($codes as $code) $str = $code . $str . "\033[0m";
    return $str;
  }

  public static function color($str, $fCode = null, $bCode = null) {
    $xterm = new Xterm();
    return $xterm->color($fCode)->background($bCode)->str($str);
  }
}

// $xterm = new Xterm();

// echo $xterm->str('asd');


echo Xterm::color('sss');

