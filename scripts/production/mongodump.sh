#!/bin/sh

#
# Ubuntu
#

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting mongodump.sh"
mongodump --out ~/node-cms/logs/dumps/$(date +%Y%m%d-%H%M%S)/
