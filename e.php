<?php

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

// for ($i = 0; $i < 255; $i++) { 
//   echo "\033[38;5;" . $i . "m " . sprintf('%03d', $i) . " \033[0m";
//   if ($i == 7 || $i == 15)
//     echo "\n";
//   // else if ($i > 15 && ($i - 21) % 6 == 0)
//   //   echo "\n";
//   if ($i == 15)
//     break;
// }

echo "\n";
echo "\033[0;31m aaa \033[0m"; echo " "; echo "\033[38;5;" . 1 . "m " . 'aaa' . " \033[0m";
echo "\n";
echo "\033[1;31m aaa \033[0m"; echo " "; echo "\033[38;5;" . 9 . "m " . 'aaa' . " \033[0m";
echo "\n";
echo "\033[2;31m aaa \033[0m"; echo " "; echo "\033[38;5;" . 1 . "m " . 'aaa' . " \033[0m";
echo "\n";
echo "\033[3;31m aaa \033[0m"; echo " "; echo "\033[38;5;" . 1 . "m " . 'aaa' . " \033[0m";
echo "\n";
echo "\033[4;31m aaa \033[0m"; echo " "; echo "\033[38;5;" . 1 . "m " . 'aaa' . " \033[0m";
echo "\n";
echo "\033[5;31m aaa \033[0m"; echo " "; echo "\033[38;5;" . 1 . "m " . 'aaa' . " \033[0m";
echo "\n";

// echo "\n";
// echo "\033[38;5;" . 15 . "m" . 1 . " \033[0m";
// echo "\n";
// echo "\033[38;5;" . 7 . "m" . 1 . " \033[0m";


// for ($i = 0; $i <= 255; $i++) { 
//   echo "\033[48;5;" . $i . "m " . sprintf('%03d', $i) . " \033[0m";
//   if ($i == 7 || $i == 15)
//     echo "\n";
//   else if ($i > 15 && ($i - 21) % 6 == 0)
//     echo "\n";
// }