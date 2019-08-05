
# Node CMS
The simplest CMS based on pure [Node.js](https://nodejs.org) without [Express](https://expressjs.com/).  
You can manage contents with markdown text files.

## How to Run This Website
### local (macOS)
1. install Node.js (version 10)
1. install MongoDB
1. install pm2
    ```bash
    npm install pm2 -g
    ```
1. install Node CMS & node-utils
    ```bash
    git clone https://github.com/furimako/node-utils.git
    git clone https://github.com/furimako/node-cms.git
    mv -r node-cms fully-hatter
    cd fully-hatter
    npm install
    ```
1. create 'configs/mailgun-config.json'
1. start MongoDB
    ```bash
    bash scripts/local/mongod.sh
    ```
1. start server
    ```bash
    # normal mode
    node app.js

    # debug mode
    node inspect app.js
    ```

### production (ubuntu)
1. set up server with below commands
    ```bash
    # install Node.js (version 10)
    curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
    sudo apt-get install -y nodejs

    # install MongoDB
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org

    # install pm2
    sudo npm install pm2 -g

    # install Node CMS
    git clone https://github.com/furimako/node-cms.git
    cd fully-hatter
    npm install

    ```
1. create 'configs/mailgun-config.json'  
1. start MongoDB
    ```bash
    bash scripts/production/mongod.sh start
    ```
1. start server
    ```bash
    npm start
    ```
1. set-up crontab
    ```bash
    crontab configs/crontab/crontab.config
    ```

## How to Backup (on macOS)
1. execute below command on macOS
    ```bash
    bash scripts/local/backup.sh
    ```
1. delete unneeded logs in server

## Error check
```bash
# MongoDB
tail /var/log/mongodb/mongod.log

# Server (PM2)
pm2 ls
tail logs/app.log
tail logs/app-err.log

# cron
crontab -l
tail logs/cron.log
```
