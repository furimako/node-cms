
# Fully Hatter の秘密の部屋
This is the website for Fully Hatter based on pure [Node.js](https://nodejs.org) without [Express](https://expressjs.com/).


## How to Run this website
- local (macOS)

>> bash scripts/local/mongod.sh

>> node app.js

- production (ubuntu 16.04)

>> bash scripts/production/mongod.sh start

>> npm start


## TODO
Timezone

prod
    サーバー停止
        bash scripts/production/mongod.sh stop (forever??)
        forever stop app.js
    毎週
        reboot app.js
        change log file name (with date)
        db backup




- DNS setting
- favicon
- 黒一色で本当に良い？ ピンクの色はあれでいい？
- update [about] page


# NOTE
- setup mail
- implement [auto translation]
- check on PC, Android and iOS
- check whether all mustache template tags work correctly
- view setting (google search result)
- view setting (for Twitter share)
- view setting (for Facebook share)
- add some games with Vue or React (like FFT ?)
