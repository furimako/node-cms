
#!/bin/sh

# 
# macOS
# 

local_path="/Users/furimako/Dropbox/makoto/backup/fully-hatter/$(date +%Y%m%d)"
mkdir $local_path

sudo scp -i /Users/furimako/.ssh/LightsailDefaultPrivateKey-ap-northeast-1.pem -r ubuntu@furimako.com:~/fully-hatter/log/* $local_path

echo "[$(date +"%Y/%m/%d %H:%M:%S")] [info] created backup"
echo $local_path
