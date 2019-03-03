
#!/bin/sh

#
# Ubuntu
#

# update modules
sudo apt update
sudo apt -y dist-upgrade

# install Node.js (version 10)
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs

# install mongoDB
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# install pm2
sudo npm install pm2 -g

# install fully-hatter
git clone https://github.com/FullyHatter/fully-hatter.git
cd fully-hatter
npm install
