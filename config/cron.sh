
#!/bin/sh

# 
# Ubuntu 16.04
# 

echo 'confirm crontab & forever list'
crontab -l
forever list

echo 'stop Server'
forever stop server

echo 'backup mongoDB'
bash /home/ubuntu/fully-hatter/scripts/production/mongodump.sh

echo 'start Server'
cd /home/ubuntu/fully-hatter
npm start

echo 'confirm forever list'
forever list
