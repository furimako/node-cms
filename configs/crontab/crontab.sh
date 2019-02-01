
#!/bin/sh

# 
# Ubuntu 16.04
# 

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [info] confirm crontab & PM2 list"
crontab -l
pm2 ls

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [info] stop Server"
cd ~/fully-hatter
npm stop

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [info] backup mongoDB"
bash ~/fully-hatter/scripts/production/mongodump.sh

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [info] rotate log files"
cd ~/fully-hatter/logs
mv app.log archives/app_$(date +%Y%m%d%H%M%S).log

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [info] start Server"
cd ~/fully-hatter
npm start
