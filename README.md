
# Fully Hatter の秘密の部屋
This is the website for Fully Hatter based on pure [Node.js](https://nodejs.org) without [Express](https://expressjs.com/).

## How to Run This Website
- local (macOS)
>> bash scripts/local/mongod.sh  
>> node app.js

- production (ubuntu 16.04)
>> rename '[sample]password.txt' and input password  
>> bash scripts/production/mongod.sh start  
>> npm start  
>> crontab config/crontab/crontab.config

## Error check
- mongoDB
    - bash scripts/production/mongolog.sh
- Server
    - forever list
    - tail log/forever.log
- cron
    - crontab -l
    - tail log/cron.log



## TODO
- Fully Hatter のノート
    - 機械学習まとめ


## NOTE
- view setting (google search, Twitter & Facebook share)
- nodemailer
- add some games with Vue or React (like FFT ?)
