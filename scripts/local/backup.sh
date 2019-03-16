
#!/bin/sh

#
# macOS
#

local_path="/Users/furimako/Documents/Dropbox/makoto/backup/fully-hatter/$(date +%Y%m%d)"
mkdir $local_path

sudo scp -r furimako@furimako.com:~/fully-hatter/logs/* $local_path

echo "created backup (path: ${local_path})"
