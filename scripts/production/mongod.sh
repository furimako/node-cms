#!/bin/sh

#
# Ubuntu
#

# $1 = start, stop or restart
echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] executing mongod.sh"
sudo systemctl $1 mongod
sudo systemctl status mongod
echo 'you can see the log in [/var/log/mongodb/mongod.log]'
