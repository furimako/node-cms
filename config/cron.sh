
#!/bin/sh

# 
# Ubuntu 16.04
# 

echo '[info] confirm crontab & forever list'
crontab -l
forever list

echo '[info] stop Server'
forever stop server

echo '[info] backup mongoDB'
bash /home/ubuntu/fully-hatter/scripts/production/mongodump.sh

echo '[info] start Server'
cd /home/ubuntu/fully-hatter
npm start

echo '[info] confirm forever list'
forever list
