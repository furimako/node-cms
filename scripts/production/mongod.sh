#!/bin/sh

#
# Ubuntu
#

# $1 = start, stop or restart
echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting mongod.sh"
sudo service mongod $1
echo 'you can see the log in [/var/log/mongodb/mongod.log]'
