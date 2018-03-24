
# Fully Hatter の秘密の部屋
This is the website for Fully Hatter based on pure [Node.js](https://nodejs.org) without [Express](https://expressjs.com/).


## How to Run This Website
- local (macOS)
>> bash scripts/local/mongod.sh  
>> node app.js

- production (ubuntu 16.04)
>> bash scripts/production/mongod.sh start  
>> npm start
>> crontab cron.config


## Error check
- mongoDB
- Server (forever)
- cron


### TODO
- how to know comments

- DNS setting
- appearance
    - favicon
    - 黒一色で本当に良い？ ピンクの色はあれでいい？
    - words sizes
    - update [about] page
    - check whether all mustache template tags work correctly
- implement [auto translation]
- view setting (google search, Twitter & Facebook share)


### NOTE
- add some games with Vue or React (like FFT ?)
