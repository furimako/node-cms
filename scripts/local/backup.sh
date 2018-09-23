
#!/bin/sh

# 
# macOS
# 

mkdir /Users/furimako/Dropbox/makoto/backup/fully-hatter/$(date +%Y%m%d)

sudo scp -i "/Users/furimako/.ssh/LightsailDefaultPrivateKey-ap-northeast-1.pem" -r ubuntu@furimako.com:/home/ubuntu/fully-hatter/log/* /Users/furimako/Dropbox/makoto/backup/fully-hatter/$(date +%Y%m%d)/

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] created backup'
echo '/Users/furimako/Dropbox/makoto/backup/fully-hatter/'$(date +%Y%m%d)
