
#!/bin/sh

sudo mongodump --out ./data/dump/$(date +%Y%m%d-%H%M%S)/
