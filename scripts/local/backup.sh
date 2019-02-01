
#!/bin/sh

# 
# macOS
# 

local_path="/Users/furimako/Dropbox/makoto/backup/fully-hatter/$(date +%Y%m%d)"
mkdir $local_path

sudo scp -i /Users/furimako/.ssh/LightsailDefaultPrivateKey-ap-northeast-1.pem -r ubuntu@furimako.com:~/fully-hatter/logs/* $local_path

echo "created backup (path: ${local_path})"
