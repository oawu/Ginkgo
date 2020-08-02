/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2020, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

let App      = null
let Progress = null

const FileSystem  = require('fs')
const Exec    = require('child_process').exec

module.exports = (app, closure) => {
  App = app
  Progress = App.progress

  process.stdout.write("\n" + ' ' + App.color.yellow('【部署至 Github Page】') + "\n")

  const minDist  = App.path('$').relative(App.path('root'), App.path('dest'))  + App.path('$').sep

  const queue = new App.queue()
  
  queue.enqueue(next => Progress.block('檢查輸出目錄是否有 .gitignore 檔案', Progress.cmd('執行動作', 'check ' + minDist + '.gitignore is exists'))
    .doing(progress => progress.result(FileSystem.existsSync(App.path('dest') + '.gitignore')).success())
    .go((_, hasIgnore) => next(hasIgnore)))

  queue.enqueue((next, hasIgnore) => hasIgnore
    ? Progress.block('暫存輸出目錄內的 .gitignore 檔案', Progress.cmd('執行動作', 'read ' + minDist + '.gitignore'))
      .doing(progress => FileSystem.readFile(App.path('dest') + '.gitignore', 'utf8', (error, data) => error
        ? progress.failure(null, error)
        : progress.result(data).success()))
      .go((_, gitignore) => next(gitignore))
    : next(null))

  queue.enqueue((next, gitignore) => gitignore !== null 
    ? Progress.block('移除輸出目錄內的 .gitignore 檔案', Progress.cmd('執行動作', 'remove ' + minDist + '.gitignore'))
      .doing(progress => FileSystem.unlink(App.path('dest') + '.gitignore', error => error
        ? progress.failure(null, error)
        : progress.success()))
      .go(_ => next(gitignore))
    : next(null))

  queue.enqueue((next, gitignore) => Progress.block('在輸出目錄內初始 git', Progress.cmd('執行動作', 'cd ' + minDist + ' && git init'))
    .doing(progress => FileSystem.existsSync(App.path('dest') + '.git')
      ? Exec('rm -rf ' + App.path('dest') + '.git', error => error
        ? progress.failure(null, error)
        : Exec('cd ' + App.path('dest') + ' && git init', error => error
          ? progress.failure(null, error)
          : progress.success()))
      : Exec('cd ' + App.path('dest') + ' && git init', error => error
        ? progress.failure(null, error)
        : progress.success()))
    .go(_ => next(gitignore)))

  queue.enqueue((next, gitignore) => Progress.block('將輸出目錄內所有檔案加入 git', Progress.cmd('執行動作', 'git add --all'))
    .doing(progress => Exec('cd ' + App.path('dest') + ' && git add --all', error => error
      ? progress.failure(null, error)
      : progress.success()))
    .go(_ => next(gitignore)))

  queue.enqueue((next, gitignore) => Progress.block('建立輸出目錄的 git commit 紀錄', Progress.cmd('執行動作', 'git commit --message "' + App.config.deploy.github.commitMessage + '"'))
    .doing(progress => Exec('cd ' + App.path('dest') + ' && git commit --message "' + App.config.deploy.github.commitMessage + '"', error => error
      ? progress.failure(null, error)
      : progress.success()))
    .go(_ => next(gitignore)))

  queue.enqueue((next, gitignore) => Progress.block('將輸出目錄的 git push 至 github', Progress.cmd('執行動作', 'git push --force git@github.com:' + App.config.deploy.github.account + '/' + App.config.deploy.github.repository + '.git master:' + App.config.deploy.github.branch))
    .doing(progress => Exec('cd ' + App.path('dest') + ' && git push --force git@github.com:' + App.config.deploy.github.account + '/' + App.config.deploy.github.repository + '.git master:' + App.config.deploy.github.branch, error => error
      ? progress.failure(null, error)
      : progress.success()))
    .go(_ => next(gitignore)))

  queue.enqueue((next, gitignore) => Progress.block('移除輸出目錄的 git', Progress.cmd('執行動作', 'remove ' + minDist + '.git'))
    .doing(progress => Exec('rm -rf ' + App.path('dest') + '.git', error => error
      ? progress.failure(null, error)
      : progress.success()))
    .go(_ => next(gitignore)))
  
  queue.enqueue((next, gitignore) => gitignore === null
    ? closure()
    : Progress.block('在輸出目錄內建立 .gitignore 檔案', Progress.cmd('執行動作', 'write ' + minDist + '.gitignore'))
      .doing(progress => FileSystem.writeFile(App.path('dest') + '.gitignore', gitignore, 'utf8', error => error
        ? progress.failure(null, error)
        : progress.success()))
      .go(closure))
}