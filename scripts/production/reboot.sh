#!/bin/sh

#
# Ubuntu
#

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting reboot.sh"

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L stop Server"
cd ~/node-cms
pm2 stop all
echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L starting backup"
bash ~/node-cms/scripts/production/mongodump.sh
cd ~/node-cms/logs
mv app.log archives/app_$(date +%Y%m%d%H%M%S).log

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] finished reboot.sh"
