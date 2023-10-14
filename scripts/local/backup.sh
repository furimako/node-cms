#!/bin/sh

#
# macOS
#

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting backup.sh"
local_path="/Users/furimako/Library/CloudStorage/Dropbox/makoto/5_others/backups/node-cms/$(date +%Y%m%d)"
mkdir $local_path

sudo scp -i ~/.ssh/id_rsa -r furimako@furimako.com:~/node-cms/logs/* $local_path
echo "created backup (path: ${local_path})"
