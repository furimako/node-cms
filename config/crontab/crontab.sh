
#!/bin/sh

# 
# Ubuntu 16.04
# 

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] confirm crontab & forever list'
crontab -l
forever list

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] stop Server'
forever stop server

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] backup mongoDB'
bash /home/ubuntu/fully-hatter/scripts/production/mongodump.sh

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] rotate log files'
cd /home/ubuntu/fully-hatter/log
mv server.log archives/server_`date +%Y%m%d%H%M%S`.log

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] start Server'
cd /home/ubuntu/fully-hatter
npm start

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] confirm forever list'
forever list
