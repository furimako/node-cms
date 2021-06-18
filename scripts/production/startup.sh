#!/bin/sh

#
# Ubuntu
#

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting startup.sh"
echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] confirm status"
crontab -l

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting MongoDB"
bash ~/node-cms/scripts/production/mongod.sh start

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting application"
cd ~/node-cms
npm start
