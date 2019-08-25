/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Maple ApiDoc
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const print   = require('../Ginkgo').print
const Display = require('../Display')
const Xterm   = require('../Xterm')
const Argv    = require('./Argv')

const get = (items, closure) => {
  const line = require('readline').createInterface({ input: process.stdin, output: process.stdout })
  line.question(Xterm.color.red(process.platform === 'win32' ? ' >' : ' ➜') + ' 請輸入您的選項：', answer => {
    line.close()

    let cho = answer.toLowerCase().trim()
    if (isNaN(cho))
      return get(items, closure)

    cho = parseInt(cho, 10)

    return typeof items[cho - 1] === 'undefined' ? get(items, closure) : closure(items[cho - 1].value)
  })
}

const choice = (d4, items, closure) => {
  let inItems = false

  for (let i in items) {
    inItems = inItems || d4 == items[i].value

    let str = ''
    str += ' '

    if (d4 == items[i].value)
      str += process.platform === 'win32'
              ? Xterm.color.green('>')
              : Xterm.color.green('➜')
    else
      str += ' '
    
    str += ' '.repeat(2)

    let title = (parseInt(i, 10) + 1) + '. ' + items[i].title

    if (d4 == items[i].value)
      str += Xterm.color.green(title)
    else
      str += Xterm.color.gray(title)

    str += ' '
    str += Xterm.color.black('─', true).dim()
    str += ' '

    if (d4 == items[i].value)
      str += Xterm.color.green(items[i].subtitle).dim()
    else
      str += Xterm.color.gray(items[i].subtitle).dim()

    print(str + Display.LN)
  }

  return inItems ? closure(d4) : get(items, closure)
}

module.exports = {
  choice: choice,
  default: (s3Closure, githubClosure) => true &&
    Display.title('部署平台') &&
    choice(Argv.data.goal, [
      { title: 'GitHub Pages', subtitle: 'gh-pages branch',            value: 'gh-pages' },
      { title: 'Amazon S3   ', subtitle: 'AWS Simple Storage Service', value: 'aws-s3' }
    ], val => {
      Argv.data.goal = val

      return Display.title('是否壓縮') && choice(Argv.data.minify, [
        { title: '要！我要將一切壓縮', subtitle: 'Yes, compress them', value: true },
        { title: '不要，我要保持原樣', subtitle: 'No, keep them original', value: false },
      ], val => {
        Argv.data.minify = val

        return Argv.data.goal == 'aws-s3'
          ? s3Closure && s3Closure()
          : githubClosure && githubClosure()
      })
    })
}