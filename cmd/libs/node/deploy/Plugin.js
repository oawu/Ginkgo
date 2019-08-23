/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

const print      = require('../Ginkgo').print
const Display    = require('../Display')
const Xterm      = require('../Xterm')
const Rollback   = require('./Rollback')
const Argv       = require('./Argv')
const CmdExists  = require('command-exists').sync
const Exec       = require('child_process').exec
const Exists     = require('fs').existsSync
const Path       = require('path')

let cmds = []
let result = {}

const jsJson = str => {
  try {
    JSON.parse(str)
    return true
  } catch (error) {
    return false
  }
}

const getArgv = key => {
  const argvs = process.argv.slice(2)

  for(let i = 0; i < argvs.length; i++)
    if ([key].indexOf(argvs[i].toLowerCase()) !== -1)
      if (typeof argvs[i + 1] !== 'undefined' && argvs[i + 1][0] != '-')
        return argvs[i + 1]
      else if (typeof argvs[i + 1] === 'undefined' || argvs[i + 1][0] == '-')
        return ''

  return ''
}

const checkPlugins = () => {
  Display.lines('取得外掛',
    ['執行動作', 'get plugin files'])

  Argv.plugins = Argv.setPlugins()

  Display.line(Argv.plugins.length)

  Argv.plugins = Argv.plugins.map(plugin => {
    plugin.file = Path.plugin + plugin.file
    plugin.argv = plugin.argv.replace(/\{\{(.*?)\}\}/gm, (...match) => getArgv(match[1]))

    return Display.line() && Exists(plugin.file)
      ? plugin
      : Display.line(false) || Rollback(['「' + plugin.title + '」外掛檔案不存在！', '檔案位置：' + plugin.file])
  })

  return Display.line(true) && Argv.plugins.length
    ?  print(' '.repeat(3) + Display.markList() + ' 目前可執行的外掛有 ' + Xterm.color.gray(Argv.plugins.length, true) + ' 個喔！' + Display.LN)
    : !print(' '.repeat(3) + Display.markList() + ' 目前沒有可執行的外掛喔！' + Display.LN)
}

const execPlugins = (i, closure) => {
  // 取代參數，將之前的外掛吐出的比對參數
  Argv.plugins[i].argv = Argv.plugins[i].argv.replace(/\{(.*?)\}/gm, (...match) => typeof result[match[1]] === 'undefined' ? '' : result[match[1]])
  
  let pluginCmd = Argv.plugins[i].cmd + ' ' + Argv.plugins[i].file + ' ' + Argv.plugins[i].argv

  Display.lines('執行外掛 ' +  Xterm.color.gray(Argv.plugins[i].title, true) + '',
    ['執行指令', pluginCmd])

  return Exec(pluginCmd, (error, stdout, stderr) => {
    if (error) {
      error = ['相關原因：' + error.message]
      
      if (jsJson(stdout))
        stdout = JSON.parse(stdout)
      
      if (typeof stdout === 'object')
        if (Array.isArray(stdout))
          error = error.concat(stdout)
        else
          for (var key in stdout)
            error.push(key + '：' + stdout[key])

      return Display.line(false) || Rollback(error)
    }

    result[Argv.plugins[i].title] = stdout
    
    return Display.line(true) && runPlugins(i + 1, closure)
  })
}

const runPlugins = (i, closure) => {
  if (i >= Argv.plugins.length)
    return closure && closure()

  Display.lines('確認是否可以執行 ' +  Xterm.color.gray(Argv.plugins[i].cmd, true) + ' 指令',
    ['執行動作', 'check ' + Argv.plugins[i].cmd + ' command'])

  if (cmds.indexOf(Argv.plugins[i].cmd) !== -1)
    return Display.line(true) && execPlugins(i, closure)

  if (!CmdExists(Argv.plugins[i].cmd))
    return Display.line(false) || Rollback(['外掛「' + Argv.plugins[i].title + '」所需的指令「' + Argv.plugins[i].cmd + '」不存在！', '請先確認目前環境下是否可以執行「' + Argv.plugins[i].cmd + '」指令！'])

  cmds.push(Argv.plugins[i].cmd)

  return Display.line(true) && execPlugins(i, closure)
}

module.exports = (title, closure) => true &&
  Display.title(title) &&
  checkPlugins()
    ? runPlugins(0, closure)
    : closure && closure()
