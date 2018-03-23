
#!/bin/sh

sudo mongodump --out ./dump/$(date +%Y%m%d-%H%M%S)/
