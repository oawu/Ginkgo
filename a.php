<?php

if (!function_exists("sr")) {
  function sr($input, $multiplier) {
    return str_repeat($input, $multiplier);
  }
}
if (!function_exists("cliColor")) {
  function cliColor($str, $fontColor = null, $backgroundColor = null, $options = []) {
    if ($str === "")
      return "";

    $colors = ["n" => "30", "r" => "31", "g" => "32", "y" => "33", "b" => "34", "p" => "35", "c" => "36", "w" => "37"];
    $styles = ["underline" => "4", "blink" => "5", "reverse" => "7", "hidden" => "8", "u" => "4", "b" => "5", "r" => "7", "h" => "8"];

    $tmps = [];

    is_array($options) || $options = array_filter(array_map("trim", explode(",", $options)));

    if ($options = array_map("strtolower", $options))
      foreach ($options as $style)
        isset($styles[$style]) && array_push($tmps, ["\033[" . $styles[$style] . "m", "\033[0m"]);

    if ($backgroundColor !== null) {
      $c = $backgroundColor[0];
      $c = strtolower($c);
      isset($colors[$c]) && array_push($tmps, ["\033[" . ($colors[$c] + 10) . "m", "\033[0m"]);
    }

    if ($fontColor !== null) {
      strlen($fontColor) > 1 || $fontColor .= "_";
      list($c, $w) = str_split($fontColor);

      $w = $w === "_" ? ctype_upper($c) ? "2" : $w : $w;
      $c = strtolower($c);

      in_array($w, ["0", "1", "2"]) || $w = "1";
      $w = $w !== "0" ? $w === "1" ? "0" : "1" : "2";

      isset($colors[$c]) && array_push($tmps, ["\033[" . $w . ";" . $colors[$c] . "m", "\033[0m"]);
    }

    foreach ($tmps as $tmp)
      $str = $tmp[0] . $str . $tmp[1];

    return $str;
  }
}

class Display {
  const MAX_LEN = 80;

  private static function strSplitWords($str, $max = null) {
    $chars = array_filter(preg_split('//u', $str), function($t) { return $t !== ''; });
    $words = $tmps = [];

    foreach ($chars as $char) {
      if (strlen($char) == 3) {
        array_push($words, ['word' => implode('', $tmps), 'len' => count($tmps), 'chinese' => false]);
        $tmps = [];

        array_push($words, ['word' => $char, 'len' => 2, 'chinese' => true]);
      } else if ($char == ' ') {
        array_push($words, ['word' => implode('', $tmps), 'len' => count($tmps), 'chinese' => false]);
        $tmps = [];

      } else {
        array_push($tmps, $char);

        if ($max && count($tmps) >= $max) {
          array_push($words, ['word' => implode('', $tmps), 'len' => count($tmps), 'chinese' => false]);
          $tmps = [];
        }
      }
    }

    array_push($words, ['word' => implode('', $tmps), 'len' => count($tmps), 'chinese' => false]);
    $tmps = [];

    return array_filter($words, function($word) { return $word['word'] !== ''; });
  }

  private static function tokensLen($words) {
    $len = 0;
    for ($i = 0, $c = count($words); $i < $c; $i++)
      if (!$i) $len += $words[$i]['len'];
      else if ($words[$i - 1]['chinese'] && $words[$i]['chinese']) $len += $words[$i]['len'];
      else $len += $words[$i]['len'] + 1;
    return $len;
  }

  private static function lines($str, $max = null) {
    $words = self::strSplitWords($str, $max);
    $lines = $tokens = [];

    foreach ($words as $word) {
      $tokensLen = self::tokensLen($tokens);

      if (!$tokensLen) {
        array_push($tokens, $word);
      } else {
        $end = end($tokens);

        if ($end['chinese'] && $word['chinese']) {
          if ($max && $tokensLen + $word['len'] > $max) {
            
            array_push($lines, $tokens);
            $tokens = [$word];
          } else {
            array_push($tokens, $word);
          }
        } else {
          if ($max && $tokensLen + $word['len'] + 1 > $max) {
            array_push($lines, $tokens);
            $tokens = [$word];
          } else {
            array_push($tokens, $word);
          }
        }
      }
    }

    array_push($lines, $tokens);

    return array_map(function($words) {
      $str = '';
      
      for ($i = 0, $c = count($words); $i < $c; $i++)
        if (!$i) $str = $words[$i]['word'];
        else if ($words[$i - 1]['chinese'] && $words[$i]['chinese']) $str .= $words[$i]['word'];
        else $str .= ' ' . $words[$i]['word'];

      return [$str, array_sum(array_map(function($t) {
        return mb_strwidth($t);
      }, array_filter(preg_split('//u', $str), function($t) { return $t !== ''; })))];
    }, $lines);
  }

  public static function error($content, $titile = '錯誤') {
    $lines = self::lines($content, Display::MAX_LEN - 8);
    $titleLen = array_sum(array_map(function($t) {
      return strlen($t) == 3 ? 2 : 1;
    }, array_filter(preg_split('//u', $titile), function($t) { return $t !== ''; })));

    echo "\n";
    echo cliColor(' ╭', 'W', 'r') . cliColor('─', 'W', 'r') . cliColor(' ' . $titile . ' ', 'Y', 'r') . cliColor(sr('─', Display::MAX_LEN - $titleLen - 7), 'W', 'r') . cliColor('╮ ', 'W', 'r');
    echo "\n";
    echo cliColor(' │', 'W', 'r') . cliColor(sr(' ', Display::MAX_LEN - 4), 'w0', 'r') . cliColor('│ ', 'W', 'r');
    echo "\n";
    foreach ($lines as $line) {
      echo cliColor(' │', 'W', 'r') . cliColor('  ' . $line[0] . '  ' . sr(' ', Display::MAX_LEN - $line[1] - 8), 'W', 'r') . cliColor('│ ', 'W', 'r');
      echo "\n";
    }
    echo cliColor(' ╰', 'W', 'r') . cliColor(sr('─', Display::MAX_LEN - 4), 'W', 'r') . cliColor('╯ ', 'W', 'r');
    echo "\n";
    echo "\n";
    exit(1);
  }
}

// class Str {
//   private $str;

//   public function __construct($str) {
//     $this->str = $str;
//   }

//   public function __toString() {
//     return is_string($this->str) ? $this->str : '';
//   }
// }

// function str($str) {
//   return new Str($str);
// }

// echo str("aaa")->color()->bgColor();

class Color {
  private $textColor, $bgColor;
  public static $code = [
    "000000", "800000", "008000", "808000", "000080", "800080", "008080", "c0c0c0",
    "808080", "ff0000", "00ff00", "ffff00", "0000ff", "ff00ff", "00ffff", "ffffff",

    "000000", "00005f", "000087", "0000af", "0000d7", "0000ff",
    "005f00", "005f5f", "005f87", "005faf", "005fd7", "005fff",
    "008700", "00875f", "008787", "0087af", "0087d7", "0087ff",
    "00af00", "00af5f", "00af87", "00afaf", "00afd7", "00afff",
    "00d700", "00d75f", "00d787", "00d7af", "00d7d7", "00d7ff",
    "00ff00", "00ff5f", "00ff87", "00ffaf", "00ffd7", "00ffff",

    "5f0000", "5f005f", "5f0087", "5f00af", "5f00d7", "5f00ff",
    "5f5f00", "5f5f5f", "5f5f87", "5f5faf", "5f5fd7", "5f5fff",
    "5f8700", "5f875f", "5f8787", "5f87af", "5f87d7", "5f87ff",
    "5faf00", "5faf5f", "5faf87", "5fafaf", "5fafd7", "5fafff",
    "5fd700", "5fd75f", "5fd787", "5fd7af", "5fd7d7", "5fd7ff",
    "5fff00", "5fff5f", "5fff87", "5fffaf", "5fffd7", "5fffff",

    "870000", "87005f", "870087", "8700af", "8700d7", "8700ff",
    "875f00", "875f5f", "875f87", "875faf", "875fd7", "875fff",
    "878700", "87875f", "878787", "8787af", "8787d7", "8787ff",
    "87af00", "87af5f", "87af87", "87afaf", "87afd7", "87afff",
    "87d700", "87d75f", "87d787", "87d7af", "87d7d7", "87d7ff",
    "87ff00", "87ff5f", "87ff87", "87ffaf", "87ffd7", "87ffff",

    "af0000", "af005f", "af0087", "af00af", "af00d7", "af00ff",
    "af5f00", "af5f5f", "af5f87", "af5faf", "af5fd7", "af5fff",
    "af8700", "af875f", "af8787", "af87af", "af87d7", "af87ff",
    "afaf00", "afaf5f", "afaf87", "afafaf", "afafd7", "afafff",
    "afd700", "afd75f", "afd787", "afd7af", "afd7d7", "afd7ff",
    "afff00", "afff5f", "afff87", "afffaf", "afffd7", "afffff",

    "d70000", "d7005f", "d70087", "d700af", "d700d7", "d700ff",
    "d75f00", "d75f5f", "d75f87", "d75faf", "d75fd7", "d75fff",
    "d78700", "d7875f", "d78787", "d787af", "d787d7", "d787ff",
    "d7af00", "d7af5f", "d7af87", "d7afaf", "d7afd7", "d7afff",
    "d7d700", "d7d75f", "d7d787", "d7d7af", "d7d7d7", "d7d7ff",
    "d7ff00", "d7ff5f", "d7ff87", "d7ffaf", "d7ffd7", "d7ffff",

    "ff0000", "ff005f", "ff0087", "ff00af", "ff00d7", "ff00ff",
    "ff5f00", "ff5f5f", "ff5f87", "ff5faf", "ff5fd7", "ff5fff",
    "ff8700", "ff875f", "ff8787", "ff87af", "ff87d7", "ff87ff",
    "ffaf00", "ffaf5f", "ffaf87", "ffafaf", "ffafd7", "ffafff",
    "ffd700", "ffd75f", "ffd787", "ffd7af", "ffd7d7", "ffd7ff",
    "ffff00", "ffff5f", "ffff87", "ffffaf", "ffffd7", "ffffff",

    "080808", "121212", "1c1c1c", "262626", "303030", "3a3a3a",
    "444444", "4e4e4e", "585858", "626262", "6c6c6c", "767676",
    "808080", "8a8a8a", "949494", "9e9e9e", "a8a8a8", "b2b2b2",
    "bcbcbc", "c6c6c6", "d0d0d0", "dadada", "e4e4e4", "eeeeee"
  ];

  public function textColor($color = null) {
    $this->textColor = $color;
    return $this;
  }
  public function bgColor($color = null) {
    $this->bgColor = $color;
    return $this;
  }
  public function text($str) {
    is_string($str)
      || $str = '';

  }
  static public function create($textColor = null) {
    $color = new Color();
    return $color->textColor($textColor);
  }
  // public function __toString() {
  //   return 
  // }

}
// echo "\033[3B" . "asd" .  "\033[0m";
// // echo "\033[1m" . "asd" .  "\033[0m";
// echo "\n";

// $color = Color::create(202)
// echo $color->text("aaa");

// Display::error('夜不前…對：的aa大聯此存容投；現子念也花斯間綠，提下會，安象看定花應委點得病具地天公下持。地果信上成假裡發。');
// echo cliColor('經啟動', 'g');
// Display::error('知報山機實謝他國教我富自形……等復活立我！歷小情權在輕便，的細來實管在！還議機……教容專文遠電？不格據望：再元滿人的；快過一師走專導。滿油戰！陸北切候工果產保取行油復色希落雙輕氣寶節子們切。', 'title');





