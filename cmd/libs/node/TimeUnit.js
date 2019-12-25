/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

module.exports = startAt => {
  let now = parseInt((new Date().getTime() - startAt) / 1000, 10)
  
  if (now === 0)
    return '太快了…'

  let units = []

  const contitions = [
    { base: 60, format: '秒' },
    { base: 60, format: '分鐘' },
    { base: 24, format: '小時' },
    { base: 30, format: '天' },
    { base: 12, format: '個月' },
  ]

  for (var i in contitions) {
    let nowUnit = now % contitions[i].base
    
    if (nowUnit != 0)
      units.push(nowUnit + contitions[i].format)

    now = Math.floor(now / contitions[i].base)
    if (now < 1)
      break
  }

  if (now > 0)
    units.push(now + '年')

  if (units.length < 1)
    units.push(now + '秒')

  return units.reverse().join(' ')
}
