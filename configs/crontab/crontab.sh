
#!/bin/sh

#
# Ubuntu
#

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] confirm status"
crontab -l
pm2 ls

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] stop Server"
cd ~/node-cms
pm2 stop all

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting backup"
bash ~/node-cms/scripts/production/mongodump.sh
cd ~/node-cms/logs
mv app.log archives/app_$(date +%Y%m%d%H%M%S).log

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] stop MongoDB"
bash ~/node-cms/scripts/production/mongod.sh stop

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] renew Certbot"
sudo apt-get update
sudo apt-get -y dist-upgrade
sudo certbot renew

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] reboot"
sudo shutdown -r now
