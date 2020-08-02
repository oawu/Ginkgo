# Ginkgo

版本：5.2.0

用自己做出來的工具開發，就想再品嚐自己做的一道菜，美味自己知道，歡迎大家來品嚐這道美味的銀杏大餐！

## 說明
這是一套 [OA Wu](https://www.ioa.tw/) 所製作的個人網頁前端框架，主功能是快速編寫網頁，主要語言為 [HTML](https://zh.wikipedia.org/zh-tw/HTML)、[SCSS](https://sass-lang.com/guide)、[JsvaScript](https://zh.wikipedia.org/wiki/JavaScript) 的框架，並寫在 `cmd` 目錄可使用 `Node.js` 協助開發，使用之前需要安裝 [Node.js](https://nodejs.org/) 與 [Compass](http://compass-style.org/)，以下依據作業系統介紹做初步安裝：

## 環境

* 需要有 `node`、`npm`、`compass` 指令
* 因應需求，可以視情況關閉 `PHP` 功能，於 `cmd/cfg/Main.js` 將 `enablePHP` 改為 `null`

### 安裝
  * Window7 ─ 請參考 [WindowInstall](cmd/doc/WindowInstall.md)
  * MacOS ─ 請參考 [PHP](https://www.ioa.tw/macOS/PHP.html)、[RubyOnRails]([RoR](https://www.ioa.tw/macOS/RubyOnRails.html))、[Compass](https://www.ioa.tw/macOS/Compass.html)、[Node](https://www.ioa.tw/macOS/Node.js.html)

## 開發

1. 終端機進入專案目錄下的 `cmd` 目錄。
2. 在 `cmd` 目錄下執行指令 `node serve.js` 即可！
3. 開發皆在 `src` 目錄內開發。

#### 參數

* `--port` 縮寫 `-P`，開發時本地伺服器的 **port**，預設值：**cfg/Main.js 內設定**

## 編譯

1. 終端機進入專案目錄下的 `cmd` 目錄。
2. 在 `cmd` 目錄下執行指令 `node build.js` 即可！
3. 結果會產生在 `dist` 目錄內。

#### 參數

* `--env` 縮寫 `-E`，編譯檔案時使用，需開啟 `PHP`（enablePHP: true） 功能才會使用到，預設值：`Development`
* `--base-url` 縮寫 `-U`，編譯檔案時使用，需開啟 `PHP`（enablePHP: true） 功能才會使用到，預設值：**空字串**

## 部署

* 參數 `--goal` 縮寫 `-G`，部署到哪個平台，有 `s3` 與 `github` 兩個目標，預設為 `github`
* 部署前會先執行 **編譯** 功能，故保留編譯的 `--env` 與 `--base-url` 參數功能

### 部署 GitHub

1. 終端機進入專案目錄下的 `cmd` 目錄。
2. 在 `cmd` 目錄下執行指令 `node deploy.js`

#### 參數

* `--account` 縮寫 `-A`，部署目標的 **GitHub** 帳號
* `--repository` 縮寫 `-R`，部署目標的 **GitHub** 倉庫（repository）
* `--branch` 縮寫 `-B`，部署目標的 **GitHub** 分支（branch）
* `--message` 縮寫 `-M`，部署時的 **commit** 訊息

### 部署 S3

1. 終端機進入專案目錄下的 `cmd` 目錄。
2. 在 `cmd` 目錄下執行指令 `node deploy.js --goal s3 --bucket bucket --access access --secret secret`

#### 參數

* `--bucket` 縮寫 `-B`，**S3** 上的 `bucket` 名稱
* `--access` 縮寫 `-A`，**AWS** 使用者的存取金鑰 `access key`（存取金鑰 ID）
* `--secret` 縮寫 `-A`，**AWS** 使用者的存取金鑰 `secret key`（私密存取金鑰）
