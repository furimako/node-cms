
# Fully Hatter の秘密の部屋
This is the website for Fully Hatter based on pure [Node.js](https://nodejs.org) without [Express](https://expressjs.com/).

## How to Run This Website
### local (macOS)
1. create 'configs/mailgun-config.json'  
1. start MongoDB
    > bash scripts/local/mongod.sh
1. start server
    > npm run start-dev

### production (ubuntu 16.04)
1. create 'configs/mailgun-config.json'  
1. start MongoDB
    > bash scripts/production/mongod.sh start
1. start server
    > npm start
1. set-up crontab
    > crontab configs/crontab/crontab.config

## How to Backup (on macOS)
1. execute below command on macOS
    > bash scripts/local/backup.sh
1. delete unneeded logs in server

## Error check
- mongoDB
    - tail /var/log/mongodb/mongod.log
- Server (PM2)
    - pm2 ls
    - tail logs/server.log
    - tail logs/server-err.log
- cron
    - crontab -l
    - tail logs/cron.log
