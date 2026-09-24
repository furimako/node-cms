#!/bin/sh

#
# Ubuntu
#

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting backup.sh"

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L confirm crontab status"
crontab -l
echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L starting backup"
bash ~/node-cms/scripts/production/mongodump.sh
cd ~/node-cms/logs
mv app.log archives/app_$(date +%Y%m%d%H%M%S).log
# pm2 keeps writing to the moved file until it reopens the log files (no restart needed)
echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO]     L reopen the log files"
pm2 reloadLogs

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] finished backup.sh"
