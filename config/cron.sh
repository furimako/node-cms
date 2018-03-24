
#!/bin/sh

# 
# Ubuntu 16.04
# 

# stop Server
forever stop server

# backup DB
bash /home/ubuntu/fully-hatter/scripts/production/mongodump.sh

# rotate log files
DATE=$(date +%Y%m%d-%H%M%S)
mkdir /home/ubuntu/fully-hatter/log/archives/${DATE}
cd /home/ubuntu/fully-hatter/log
mv forever.log ./archives/${DATE}/forever.log
mv stdout.log ./archives/${DATE}/stdout.log
mv stderr.log ./archives/${DATE}/stderr.log

# start Server
cd /home/ubuntu/fully-hatter
npm start