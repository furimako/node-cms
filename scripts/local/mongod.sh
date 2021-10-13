#!/bin/sh

# 
# macOS
# 

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] executing mongod.sh"
mongod --dbpath=./mongodb_data
