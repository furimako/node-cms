
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
1. create 'configs/configs.js' (copy 'configs/configs.js.sample')
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
    ```
1. create 'configs/configs.js' (copy 'configs/configs.js.sample')
1. start MongoDB
    ```bash
    bash scripts/production/mongod.sh start
    ```
1. place the certificate where the app reads it
    ```bash
    ## the restart is skipped here because the app is not running yet
    sudo bash ~/node-cms/scripts/production/certbot-deploy-hook.sh
    ```
1. start server
    ```bash
    npm start
    ```
1. set up automatic renewal (see 'How to renew certbot')
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
The certificate is renewed automatically.
The app serves the ACME challenge files from 'static/.well-known/acme-challenge/' on every request, so certbot can use the '--webroot' plugin without any manual work.
The snap version of certbot runs 'certbot renew' twice a day with 'snap.certbot.renew.timer', and 'scripts/production/certbot-deploy-hook.sh' copies the renewed certificate into 'configs/production/ssl/' and restarts the app.

### Set-up (once per server)
The order matters. 'certbot reconfigure' does not issue a certificate, so the deploy hook has to be executed by hand first to place the current certificate into 'configs/production/ssl/'.
The hook assumes the user 'furimako' and the path '/home/furimako/node-cms'. Edit the variables at the top of the hook when they differ.

```bash
## place the current certificate and restart the app
## (skip this on a new server, it is already done in 'Production (Ubuntu 20.04)')
sudo bash ~/node-cms/scripts/production/certbot-deploy-hook.sh

## make certbot renew with the '--webroot' plugin and run the deploy hook
## (it validates the new config with a dry-run before applying it)
sudo certbot reconfigure --cert-name furimako.com \
    --authenticator webroot \
    --webroot-path ~/node-cms/static \
    --deploy-hook ~/node-cms/scripts/production/certbot-deploy-hook.sh
```

### Migration from the manual set-up (once)
On the server which still renews the certificate with 'certbot certonly --manual', do the below before the set-up above.
```bash
## deploy the code
cd ~/node-cms
git pull
```
And after the set-up, make /etc/letsencrypt root-only again ('chmod 555 -R /etc/letsencrypt' is not needed anymore).
```bash
sudo chmod -R u+rwX,go-rwx /etc/letsencrypt/archive /etc/letsencrypt/live /etc/letsencrypt/keys
```
Delete the challenge files left in 'static/.well-known/acme-challenge/' as well.

### Monitoring
Let's Encrypt stopped sending expiration notices in June 2025, and certbot has no hook for a failed renewal, so 'scripts/production/check-cert.js' is the only thing which notices a broken renewal.
It is run daily by cron, checks the certificate which furimako.com actually serves, and sends an email when the certificate expires in less than 20 days or when it cannot be checked at all.
Looking at the served certificate (not the file) covers every failure: a renewal error, a stopped 'snap.certbot.renew.timer', a failed deploy hook and a missing restart.

It also sends an email every monday even when everything is fine, so that a broken notification path (cron, node or SMTP) shows up as a missing email within a week.
Note that nothing is sent when the server itself is down; that is a different thing to monitor.

```bash
## make sure the email is delivered (do this once after the set-up)
NODE_ENV=production node ~/node-cms/scripts/production/check-cert.js --test
```

### Check
```bash
## 'reconfigure' needs certbot 2.3.0 or later
sudo certbot --version

## the expiry date and the certificate path
sudo certbot certificates

## 'authenticator = webroot' and the deploy hook are recorded
sudo cat /etc/letsencrypt/renewal/furimako.com.conf

## the challenge is served correctly (deploy hooks are NOT executed on dry-run)
sudo certbot renew --dry-run

## the timer is active
systemctl list-timers | grep certbot
tail /var/log/letsencrypt/letsencrypt.log
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
