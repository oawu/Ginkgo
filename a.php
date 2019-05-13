<?php

function cache($ttl, $key, $func) {
  $path = __DIR__ . DIRECTORY_SEPARATOR . 'tmp' . DIRECTORY_SEPARATOR . $key;
  
  if (file_exists($path) && is_readable($path)) {
    $content = file_get_contents($path);
    $content = json_decode($content, true);
    
    if (time() < $content['etime']) {
      return $content['val'];
    }
  }

  $val = $func();
  file_put_contents($path, json_encode(['etime' => time() + $ttl, 'val' => $val]));
  return $val;
}

$str = cache(6000, 'a', function() {
  $url = 'http://data.ntpc.gov.tw/od/data/api/EDC3AD26-8AE7-4916-A00B-BC6048D19BF8?$format=json';
  $content = file_get_contents($url);
  $content = json_decode($content, true);
  return $content;
});

$lineIDs = array_unique(array_column($str, 'lineid'));
$var1 = array_filter($str, function($t) use ($lineIDs) {
  return $t['lineid'] == $lineIDs[0];
});

$var1 = array_values(array_map(function($var) {
  return [$var['latitude'], $var['longitude']];
}, $var1));

echo '<meta http-equiv="Content-type" content="text/html; charset=utf-8" /><pre>';
echo json_encode($var1);
exit();
echo '<meta http-equiv="Content-type" content="text/html; charset=utf-8" /><pre>';
var_dump($str[0]);
exit();