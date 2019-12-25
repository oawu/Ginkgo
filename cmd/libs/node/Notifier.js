/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

let notifierEnable = true

module.exports = (title, subtitle, message) => {
  let Notifier = require('node-notifier').NotificationCenter

  notifierEnable && new Notifier().notify({
    title: title,
    subtitle: subtitle,
    message: message,
    sound: true,
    wait: false,
    timeout: 5,
    closeLabel: '關閉',
    actions: ['不再顯示'],
    dropdownLabel: '其他',
  }, (e, r, m) => notifierEnable = !(r == 'activate' && m.activationValue == '不再顯示'))

  return true
}