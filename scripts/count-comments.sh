#!/bin/sh

# $1 = yyyy-mm-dd
fromdate=$1
mongo --eval 'db.comments.aggregate([{ $match: { date: {$gt: ISODate("'${fromdate}'T00:00:00Z")}, lan: "ja" } }, { $group: { _id: "$urlPath", count: { $sum: 1 } } }])' node-cms
