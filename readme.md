# 歡迎來到 Ginkgo 5.1
用自己做出來的工具開發，就想再品嚐自己做的一道菜，美味自己知道，歡迎大家來品嚐這道美味的銀杏大餐！

---

## 說明
這是一套 [OA Wu](https://www.ioa.tw/) 所製作的個人網頁前端框架，主功能是快速編寫網頁，主要語言為 [HTML](https://zh.wikipedia.org/zh-tw/HTML)、[SCSS](https://sass-lang.com/guide)、[JsvaScript](https://zh.wikipedia.org/wiki/JavaScript) 的框架，並寫在 `cmd` 目錄可使用 `Node.js` 協助開發，使用之前需要安裝 [Node.js](https://nodejs.org/) 與 [Compass](http://compass-style.org/)，以下依據作業系統介紹做初步安裝：

* [Window7](cmd/doc/WindowInstall.md)
* MacOS


## 使用
### 開發
1. 終端機進入專案目錄下的 `cmd` 目錄
2. 在 `cmd` 目錄下執行指令 `node serve` 即可！

### 編譯
1. 終端機進入專案目錄下的 `cmd` 目錄
2. 在 `cmd` 目錄下執行指令 `node build`，即可！

### 部署至 AWS Github
1. 終端機進入專案目錄下的 `cmd` 目錄
2. 在 `cmd` 目錄下，先執行 `node build` 後，再執行指令 `node deploy.github` 即可！

### 部署至 AWS S3
1. 請先至 `cmd/config/` 編輯 `deploy.s3.js`，填寫完正確的 S3 設定值。
2. 終端機進入專案目錄下的 `cmd` 目錄
3. 在 `cmd` 目錄下，先執行 `node build` 後，再執行指令 `node deploy.s3` 即可！


## 開發
### 說明
* 開發以 `src` 目錄內為主
* 經過 **編譯** 後的頁面會暫存在 `dist` 目錄內
* **部署** 主要就是將 `dist` 目錄丟至 Server

### SCSS
* 獨立頁面的 `.scss` 需 `@import "_/_init";` 與 `@import "_/_public";` 以免重複定義 `body`
* `@import "_/_init";` 主要是定義 body 等
* `@import "_/_public";` 主要是定義自己所需的 `@extend` 或 `mixin`

