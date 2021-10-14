#!/bin/sh

#
# Ubuntu
#

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting startup.sh"

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L confirm crontab status"
crontab -l
echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L starting node-cms"
cd ~/node-cms
npm start

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] finished startup.sh"
