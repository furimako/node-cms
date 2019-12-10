
#!/bin/sh

#
# Ubuntu
#

sudo mongodump --out ~/node-cms/logs/dumps/$(date +%Y%m%d-%H%M%S)/
