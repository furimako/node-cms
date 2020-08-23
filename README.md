
# Node CMS
The simplest CMS based on pure [Node.js](https://nodejs.org) without [Express](https://expressjs.com/).  
You can manage contents with markdown text files.

## Policy
- create CMS with the least dependencies
- make the most of server side (Node.js) power

## How to Run This Website
### macOS (local)
1. install [MongoDB Community Edition (version 4.2)](https://www.mongodb.com/download-center/community)
1. install [Node.js (version 12)](https://nodejs.org/en/download/)
1. install Node-CMS & Node-Utils
    ```bash
    git clone https://github.com/furimako/node-cms.git
    git clone https://github.com/furimako/node-utils.git
    cd node-cms
    npm install
    ```
1. create 'configs/smtp-config.json'
1. start MongoDB
    ```bash
    bash scripts/local/mongod.sh
    ```
1. start server
    ```bash
    node app.js
    ```

### Ubuntu (production)
1. set up server with below commands
    ```bash
    # install MongoDB Community Edition (version 4.2)
    wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
    sudo apt-get install gnupg
    wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
    echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    
    # install Node.js (version 12)
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # install pm2
    sudo npm install pm2 -g

    # install Node-CMS & Node-Utils
    git clone https://github.com/furimako/node-cms.git
    git clone https://github.com/furimako/node-utils.git
    cd node-cms
    npm install
    
    # set-up crontab
    crontab configs/production/crontab.conf

    # set-up Let's Encrypt
    ## Add Certbot PPA
    sudo apt-get update
    sudo apt-get install software-properties-common
    sudo add-apt-repository universe
    sudo add-apt-repository ppa:certbot/certbot
    sudo apt-get update
    
    ## Install Cearbot
    sudo apt-get install certbot
    ## [CAUTION] Stop server before executing below command
    sudo certbot certonly --standalone
    sudo chmod 777 /etc/letsencrypt/live
    sudo chmod 777 /etc/letsencrypt/archive
    ```
1. create 'configs/smtp-config.json'  
1. start MongoDB
    ```bash
    bash scripts/production/mongod.sh start
    ```
1. start server
    ```bash
    npm start
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

## Test Cases
- open every Japanese & English page (including 404 page)
- click all links in every pages (including bottom navbar)
- input every English page URL which should be invisible
- request all POST
