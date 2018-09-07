# 歡迎來到 Ginkgo
金黃色的秋意

---

<br/>

## 說明
* 這是一套 [OA Wu](https://www.ioa.tw/) 所製作的個人網頁前端框架！
* 主功能是快速編寫網頁，主要語言為 [HTML](https://zh.wikipedia.org/zh-tw/HTML)、[SCSS](https://sass-lang.com/guide)、[JsvaScript](https://zh.wikipedia.org/wiki/JavaScript) 的框架。
* 此框架在 [cmd 目錄](https://github.com/comdan66/Ginkgo/tree/master/cmd) 內可以搭配 [Node.js](https://nodejs.org/en/) 執行 watch，初始各項功能。
* 在 [cmd 目錄](https://github.com/comdan66/Ginkgo/tree/master/cmd) 中執行 `node watch` 即會自動執行 `npm install .` 將 `package.json` 內所記錄的 module 安裝起來。
* `node watch` 會開啟三種 watch，分別如下：
	* `Livereload` - 使用 [Livereload](http://livereload.com/) 時作出當目錄 `js`、`css`、`img` 內的檔案與專案內的 `.html` 更新時，即會重新整理網頁。
	* `Icon Fonts` - 配合 [icomoon](https://icomoon.io/) 的 Icon Font 目錄，將 `font` 目錄內的 `style.css` 轉換成 `.scss` 格式。
	* `Scss Files` - 當 `.scss` 檔案更新時，使用 [Compass](http://compass-style.org/) 將 `.scss` 編譯成 `.css` 檔案。
* 編譯 Scss Files 功能是仰賴 `compass` 指令，所以請先記得安裝 `compass`，安裝可以參考[此篇](http://compass-style.org/install/)

<br/>
<br/>

## 目錄結構
* `cmd 目錄` ─ `Compass` 與 `Node.js` 會用到的相關資料。
	* `config.rb 檔案` ─ `Compass` 指令的設定檔。
	* `imports 目錄` ─ `.scss` 檔案的 `@import` 的檔案存放處。
	* `package.json 檔案` ─ `Node.js` 指令的設定檔。
	* `watch 檔案` ─ 須藉由 `Node.js` 執行的檔案，主要是用來 `watch` 專案的。
* `css 目錄` ─ 經由 Compass 編譯 `.scss` 過後的 `.css` 檔案存放處。
* `font 目錄` ─ 字體目錄，通常都是 icon font 使用的。
* `js 目錄` ─ 通常是 `.js`檔案存放處。
* `scss 目錄` ─ 通常是 `.scss`檔案存放處，`Compass` 會將此目錄內的 `.scss` 檔案編譯成 `.css` 檔案存放至 `css 目錄`。


<br/>
<br/>

## 如何使用
### 開發工具
* 終端機進入專案目錄下的 `cmd 目錄`，在 cmd 目錄下執行指令 `node watch`
* 第一次使用會自動執行 `npm install .` 的指令，若 cmd 目錄權限無法寫入時，則會自動使用 `sudo` 身份執行，屆時需要輸入密碼。

<br/>

### 部署
#### 部署到 Github Pages
#### 部署到 Amazon S3
