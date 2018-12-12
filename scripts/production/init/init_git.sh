
#!/bin/sh

# 
# Ubuntu 16.04
# 

sudo apt update
sudo apt upgrade
git clone https://github.com/FullyHatter/fully-hatter.git
git config --global user.name "FullyHatter"
git config --global user.email "furimako@gmail.com"
git config --global push.default simple
