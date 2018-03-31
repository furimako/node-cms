
#!/bin/sh

# 
# Ubuntu 16.04
# 

echo '['$(date +"%Y/%m/%d %H:%M:%S")'] [info] set iptables'
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8128
