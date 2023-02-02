
# Node CMS
The simplest CMS based on pure [Node.js](https://nodejs.org) without [Express](https://expressjs.com/).  
You can manage contents with markdown text files.

## Policy
- create CMS with the least dependencies
- make the most of server side (Node.js) power

## How to Run This Website
### Local (macOS)
1. install [MongoDB Community Edition (version 6.0)](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
1. install [Node.js (version 18)](https://nodejs.org/en/download/)
1. install Node-CMS & Node-Utils
    ```bash
    git clone https://github.com/furimako/node-utils.git
    cd node-utils
    npm install
    cd ..
    git clone https://github.com/furimako/node-cms.git
    cd node-cms
    npm install
    ```
1. create 'configs/configs.json'
1. start MongoDB
    ```bash
    bash scripts/local/mongod.sh
    ```
1. start server
    ```bash
    node app.js
    ```

### Production (Ubuntu 20.04)
1. create DNS for the server
1. set up server with below commands
    ```bash
    sudo hostnamectl set-hostname furimako
    sudo timedatectl set-timezone Asia/Tokyo
    sudo apt update
    sudo apt -y dist-upgrade

    # install MongoDB Community Edition (version 6.0)
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    sudo apt-get install gnupg
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    echo "mongodb-org hold" | sudo dpkg --set-selections
    echo "mongodb-org-database hold" | sudo dpkg --set-selections
    echo "mongodb-org-server hold" | sudo dpkg --set-selections
    echo "mongodb-mongosh hold" | sudo dpkg --set-selections
    echo "mongodb-org-mongos hold" | sudo dpkg --set-selections
    echo "mongodb-org-tools hold" | sudo dpkg --set-selections
    
    # install Node.js (version 18)
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
    sudo apt-get install -y nodejs

    # install pm2
    sudo npm install pm2 -g

    # install Node-CMS & Node-Utils
    git clone https://github.com/furimako/node-utils.git
    cd node-utils
    npm install
    cd ..
    git clone https://github.com/furimako/node-cms.git
    cd node-cms
    npm install

    # setup iptables
    sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8128
    sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 8129
    sudo apt-get install iptables-persistent
    
    # set-up Let's Encrypt
    ## ensure that your version of snapd is up to date
    sudo snap install core; sudo snap refresh core
    ## install Certbot
    sudo snap install --classic certbot
    ## prepare the Certbot command
    sudo ln -s /snap/bin/certbot /usr/bin/certbot
    ## get a certificate
    ## [CAUTION] Stop server before executing below command
    sudo certbot certonly --standalone
    sudo chmod 555 -R /etc/letsencrypt
    ## test automatic renewal for your certificates by running this command
    sudo certbot renew --dry-run
    ```
1. create 'configs/configs.json'  
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
    crontab configs/production/crontab.conf
    ```

## How to Backup (on macOS)
1. execute below command on macOS
    ```bash
    bash scripts/local/backup.sh
    ```
1. delete unneeded logs in server

## How to renew certbot
```bash
sudo certbot certonly --manual
```

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
- GET (open ALL Japanese & English pages)
    - World / Story (1 page story & multiple pages story)
    - bookshelf
    - Board
    - click all links in every pages (including bottom navbar)
    - 404 page
    - input every English page URL which should be invisible
- POST (request ALL POST in ALL Japanese & English pages)
    - like
    - comment
    - message
    - resident registration (3 pattern: main, footer, home)
        - pre-registration
            - NONE
            - PRE_REGISTERED
            - REGISTERED
        - registration
