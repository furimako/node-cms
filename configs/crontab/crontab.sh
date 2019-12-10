
#!/bin/sh

#
# Ubuntu
#

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [info] confirm crontab & PM2 list"
crontab -l
pm2 ls

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [info] stop Server"
cd ~/node-cms
pm2 stop all

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [info] backup MongoDB"
bash ~/node-cms/scripts/production/mongodump.sh

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [info] rotate log files"
cd ~/node-cms/logs
mv app.log archives/app_$(date +%Y%m%d%H%M%S).log

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [info] start Server"
cd ~/node-cms
npm start
