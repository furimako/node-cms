
#!/bin/sh

# 
# Ubuntu 16.04
# 

sudo mongodump --out ~/fully-hatter/logs/dumps/$(date +%Y%m%d-%H%M%S)/
