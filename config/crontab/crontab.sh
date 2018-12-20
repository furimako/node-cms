
#!/bin/sh

# 
# Ubuntu 16.04
# 

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] confirm crontab & PM2 list'
crontab -l
pm2 ls

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] stop Server'
cd ~/fully-hatter
npm stop

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] backup mongoDB'
bash ~/fully-hatter/scripts/production/mongodump.sh

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] rotate log files'
cd ~/fully-hatter/log
mv server.log archives/server_`date +%Y%m%d%H%M%S`.log

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] start Server'
cd ~/fully-hatter
npm start
