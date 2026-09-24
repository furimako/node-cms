
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要
Express を使わず素の Node.js で furimako.com を配信する自作 CMS。

- 日本語 / 英語の 2言語構成。英語ページは URL に `/en` プレフィックスが付く
- コンテンツは `static/contents/` (ja) と `static/contents-en/` (en) のマークダウン / HTML ファイル
- MongoDB (DB 名 `node-cms`) に保存するのは いいね・コメント・住人登録のみ

## コマンド

### ローカル起動
- 事前に `configs/configs.js.sample` をコピーして `configs/configs.js` を作る (gitignore 対象)

```bash
bash scripts/local/mongod.sh   # MongoDB を ./mongodb_data で起動
node app.js                    # サーバ起動
```

HTTPS は 8129、HTTP は 8128 (8129 へ 302 リダイレクト)。ローカルは `configs/local/ssl/` のダミー証明書を使うので `https://localhost:8129` を開く。

### 本番
`npm start` (= `NODE_ENV=production pm2 start configs/production/pm2.json`)。サーバ構築手順・証明書更新・エラー確認コマンドは README.md を参照。

### テスト・lint
テストフレームワークも lint スクリプトも無い。`.eslintignore` はあるが eslint 本体も設定ファイルも未導入。動作確認は README.md の「Test Cases」の手動チェックリストで行う。

### 集計
`scripts/count-comments.sh <yyyy-mm-dd>` / `scripts/count-residents.sh` (mongo シェル経由)。

## アーキテクチャ

### リクエストの流れ
`app.js` → `src/https-handler/main.js` (try/catch で 500 応答 + エラーメール送信) → `src/https-handler/get.js` / `post.js`

### ルーティングは static/rooting.js が単一の情報源
- `src/pages.js` が起動時に `urlPath` → ページインスタンスの Map を構築する
- `class` フィールドで `HomePage` / `MarkdownPage` / `HTMLPage` / `CSSPage` / `ContentPage` を切り替える
- Map に無い URL はすべて 404 (`/no-found`)。**画像・`client.js`・CSS も rooting.js に登録しないと配信されない**

### ページは起動時に構築される
- マークダウン / HTML / SCSS / 画像の読み込みと mustache 用の `view` の組み立ては、すべてページのコンストラクタで完了している
- そのため **コンテンツ・`rooting.js`・`tags.js`・`static/template/*.mustache` を編集したらサーバの再起動が必要**
- リクエストごとに取得するのは DB 由来の値 (いいね数・コメント・住人数) だけ (`BasePage.get()`)

### ページ生成の規則
- 多言語: 要素に `ja` / `en` があるかで生成。en はファイルパスが `<filePathPrefix>-en<urlPath>`、URL が `/en<urlPath>`
- 連載: `numOfChapters` があると `-1` 〜 `-N` のページに展開され、`pagination.mustache` が付く
- テンプレート: `template.mustache` が外枠。コメント欄・関連ページ・ページネーションは先に文字列へレンダリングして `view` に差し込む方式で、mustache の partial は `residentRegistrationTemplate` だけ
- 関連ページは `static/tags.js` 起点 (1ページ最大 3タグ、`targets` は ja の urlPath)
- ホーム (`src/page/home_page.js`) は rooting.js の `styleInHome` (world / column / story) から一覧を組み、`static/picked-up-comments.js` と最新コメント (6件/ページ) を載せる。`headHTML` / `footHTML` で Bulma の 2カラムに分割している

### POST
エンドポイントは `/post/like`, `/post/comment`, `/post/fmessage`, `/post/fregister` の 4つ。

- like と comment は reCAPTCHA 検証を通らない (検証はこの 2つの分岐より後ろにある)
- message は `configs/spam_text_list.js` の部分一致 (大文字小文字無視) で弾き、400 を返す
- 住人登録は 2段階: POST で `PRE_REGISTERED` を作成 → Mailjet テンプレートのメールで `/?residentId=<ObjectId>` へ誘導 → GET 側で `REGISTERED` に更新し Mailjet のリストに追加

### その他
- 共通の小物は `src/utils/` にある。`logging.js` (JST 時刻付きの console 出力)、`jst.js` (Date → JST 文字列)、`mailer.js` (nodemailer のラッパー。件名に `【title】` を付け、本番以外は ` (dev)` を足す)
- `src/mongodb_driver.js` はクエリごとに `MongoClient` を接続・切断する。コレクションは `likes` / `comments` / `registrations`
- certbot (ACME チャレンジ) は `src/acme_challenge.js` が担当し、rooting.js に無い URL でも `/.well-known/acme-challenge/` だけは応答する
    - ページと違い **リクエストごとに** `static/.well-known/acme-challenge/` を読む。certbot の `--webroot` が書いたファイルを再起動なしで返すため
    - HTTP サーバ (8128) でもリダイレクトの前に応答する
    - 本番の証明書は `configs/production/ssl/` から読む (無ければ `/etc/letsencrypt/live/` にフォールバック)。配置と更新後の再起動は `scripts/production/certbot-deploy-hook.sh` (certbot の deploy hook) が行う
    - 更新失敗の検知は `scripts/production/check-cert.js`。日次 cron で **実際に配信されている証明書**の残り日数を見る (certbot には失敗用フックが無く、Let's Encrypt の期限切れ通知も終了しているため)
        - 接続先は `127.0.0.1:8129` (アプリの待ち受けポート)。iptables の `:443` リダイレクトは `PREROUTING -i eth0` にあり、サーバ自身が出す通信には適用されないため `furimako.com:443` では繋がらない

## ページを追加するとき
- `static/contents/<path>.md` を置く (英語版は `static/contents-en/<path>.md`)
- `static/rooting.js` の該当ブロックの `elements` に追加する (`styleInHome` 付きのブロックはホームの一覧にも出る)
- ホームに画像が出るスタイルでは `static/images/<urlPath>.jpg` を置き、`ContentPage` の `elements` にも登録する
- 関連ページに出す場合は `static/tags.js` の `targets` に追加する
- サーバを再起動して反映を確認する

## コード規約
既存コードに合わせる。

- インデント 4スペース、セミコロン無し、シングルクォート
- モジュール内部の関数・クラス内部のメソッドは `_` プレフィックス
