
#!/bin/sh

sudo mongodump --out /home/ubuntu/fully-hatter/dump/$(date +%Y%m%d-%H%M%S)/
