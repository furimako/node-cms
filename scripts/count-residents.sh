#!/bin/sh

echo '--- list all residents ---'
mongo --eval 'db.registrations.find({"residentStatus" : "REGISTERED"})' node-cms

echo '--- residents count ---'
mongo --eval 'db.registrations.find({"residentStatus" : "REGISTERED"}).count()' node-cms
