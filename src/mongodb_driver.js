const { MongoClient } = require('mongodb')
const assert = require('assert')
const logging = require('./utils/logging')

const url = 'mongodb://localhost:27017'
const dbName = 'fully-hatter'

module.exports = {
    async insert(collectionName, objs) {
        const client = new MongoClient(url, { useNewUrlParser: true })
        try {
            await client.connect()
            const collection = client.db(dbName).collection(collectionName)
            
            const r = await collection.insertMany(objs)
            assert.equal(objs.length, r.insertedCount)
            logging.info(`    L inserted ${objs.length} document(s) (collection: ${collectionName})`)
        } catch (err) {
            const errMessage = `failed to insert (mongodb_driver.js)\n${err.stack}`
            logging.error(errMessage)
            throw new Error(errMessage)
        }
        client.close()
    },
    
    async findLikeCount(urlPath) {
        const client = new MongoClient(url, { useNewUrlParser: true })
        let likeCount
        try {
            await client.connect()
            const collection = client.db(dbName).collection('likes')
            
            likeCount = await collection.find({ urlPath, id: 0 }).count()
            logging.info(`    L found ${likeCount} likeCount`)
        } catch (err) {
            const errMessage = `failed to findLikeCount (mongodb_driver.js)\n${err.stack}`
            logging.error(errMessage)
            throw new Error(errMessage)
        }
        client.close()
        return likeCount || 0
    },
    
    async findComments(urlPath) {
        const client = new MongoClient(url, { useNewUrlParser: true })
        let comments = []
        try {
            await client.connect()
            const collection = client.db(dbName).collection('comments')
            
            comments = await collection.find({ urlPath }).toArray() || []
            comments.sort((obj1, obj2) => obj1.date.getTime() - obj2.date.getTime())
            logging.info(`    L found ${comments.length} comment(s)`)
        } catch (err) {
            const errMessage = `failed to findComments (mongodb_driver.js)\n${err.stack}`
            logging.error(errMessage)
            throw new Error(errMessage)
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
            const likesCol = client.db(dbName).collection('likes')
            const commentsCol = client.db(dbName).collection('comments')
            
            const likeCountObjs = await likesCol.aggregate([
                { $match: { id: 0 } },
                { $group: { _id: '$urlPath', count: { $sum: 1 } } }
            ]).toArray()
            logging.info(`    L found ${likeCountObjs.length} likeCounts`)
            likeCountObjs.forEach((obj) => { summary.likeCount[obj._id] = obj.count })
            
            const commentCountObjs = await commentsCol.aggregate([
                { $group: { _id: '$urlPath', count: { $sum: 1 } } }
            ]).toArray()
            logging.info(`    L found ${commentCountObjs.length} commentCounts`)
            commentCountObjs.forEach((obj) => { summary.commentCount[obj._id] = obj.count })
        } catch (err) {
            const errMessage = `failed to findCountsForHome (mongodb_driver.js)\n${err.stack}`
            logging.error(errMessage)
            throw new Error(errMessage)
        }
        client.close()
        return summary
    }
}
