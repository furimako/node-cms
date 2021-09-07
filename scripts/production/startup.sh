#!/bin/sh

#
# Ubuntu
#

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting startup.sh"
echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] confirm status"
crontab -l

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] renew certbot"
sudo certbot renew
sudo chmod 444 /etc/letsencrypt/live/furimako.com/privkey.pem

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting MongoDB"
bash ~/node-cms/scripts/production/mongod.sh start

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting application"
cd ~/node-cms
npm start
