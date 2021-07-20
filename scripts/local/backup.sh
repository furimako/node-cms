#!/bin/sh

#
# macOS
#

echo "$(date +'%Y-%m-%dT%H:%M:%S')+09:00 [INFO] starting backup.sh"
local_path="/Users/furimako/Documents/Dropbox/makoto/5_others/backups/node-cms/$(date +%Y%m%d)"
mkdir $local_path

sudo scp -i ~/.ssh/LightsailDefaultKey-ap-northeast-1.pem -r ubuntu@furimako.com:~/node-cms/logs/* $local_path
echo "created backup (path: ${local_path})"
