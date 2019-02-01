const { MongoClient } = require('mongodb')
const assert = require('assert')
const logging = require('./logging')

const url = 'mongodb://localhost:27017'
const dbName = 'fully-hatter'

module.exports = {
    async insert(collectionName, objs) {
        const client = new MongoClient(url, { useNewUrlParser: true })
        try {
            await client.connect()
            logging.info('    L Connected correctly to server')
            
            const db = client.db(dbName)
            const r = await db.collection(collectionName).insertMany(objs)
            assert.equal(objs.length, r.insertedCount)
            logging.info(`    L inserted ${objs.length} document(s) (collection: ${collectionName})`)
        } catch (err) {
            logging.error(`failed to insert (mongodb_driver.js)\n\n${err.stack}`)
        }
        client.close()
    },
    
    async findLikeCount(urlPath) {
        const client = new MongoClient(url, { useNewUrlParser: true })
        let likeCount
        try {
            await client.connect()
            logging.info('    L Connected correctly to server')
            
            const db = client.db(dbName)
            const col = db.collection('likes')
            likeCount = await col.find({ urlPath, id: 0 }).count()
            logging.info(`    L found ${likeCount} likeCount`)
        } catch (err) {
            logging.error(`failed to findLikeCount (mongodb_driver.js)\n\n${err.stack}`)
        }
        client.close()
        return likeCount || 0
    },
    
    async findComments(urlPath) {
        const client = new MongoClient(url, { useNewUrlParser: true })
        let comments = []
        try {
            await client.connect()
            logging.info('    L Connected correctly to server')
            
            const db = client.db(dbName)
            const col = db.collection('comments')
            comments = await col.find({ urlPath }).toArray() || []
            comments.sort((obj1, obj2) => obj1.date.getTime() - obj2.date.getTime())
            logging.info(`    L found ${comments.length} comment(s)`)
        } catch (err) {
            logging.error(`failed to findComments (mongodb_driver.js)\n\n${err.stack}`)
        }
        client.close()
        return comments
    },
    
    async findCountsForHome() {
        const client = new MongoClient(url, { useNewUrlParser: true })
        const summary = {
            likeCount: {},
            commentCount: {}
        }
        
        try {
            await client.connect()
            logging.info('    L Connected correctly to server')
            
            const db = client.db(dbName)
            const likesCol = db.collection('likes')
            
            const likeCountObjs = await likesCol.aggregate([
                { $match: { id: 0 } },
                { $group: { _id: '$urlPath', count: { $sum: 1 } } }
            ]).toArray()
            logging.info(`    L found ${likeCountObjs.length} likeCounts`)
            likeCountObjs.forEach((obj) => { summary.likeCount[obj._id] = obj.count })
            
            const commentsCol = db.collection('comments')
            const commentCountObjs = await commentsCol.aggregate([
                { $group: { _id: '$urlPath', count: { $sum: 1 } } }
            ]).toArray()
            logging.info(`    L found ${commentCountObjs.length} commentCounts`)
            commentCountObjs.forEach((obj) => { summary.commentCount[obj._id] = obj.count })
        } catch (err) {
            logging.error(`failed to findCountsForHome (mongodb_driver.js)\n\n${err.stack}`)
        }
        client.close()
        return summary
    }
}
