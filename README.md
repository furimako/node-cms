
# Fully Hatter の秘密の部屋
This is the website for Fully Hatter based on pure [Node.js](https://nodejs.org) without [Express](https://expressjs.com/).

## How to Run This Website
### local (macOS)
1. start MongoDB
    > bash scripts/local/mongod.sh
1. start server
    > node app.js

### production (ubuntu 16.04)
1. create 'config/password.txt'  
1. start MongoDB
    > bash scripts/production/mongod.sh start
1. start server
    > npm start
1. set-up crontab
    > crontab config/crontab/crontab.config

## How to Backup
1. execute below command on macOS
    > bash scripts/local/backup.sh
1. delete unneeded logs in server

## Error check
- mongoDB
    - bash scripts/production/mongolog.sh
- Server
    - forever list
    - tail log/forever.log
- cron
    - crontab -l
    - tail log/cron.log

