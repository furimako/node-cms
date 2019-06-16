const { MongoClient } = require('mongodb')
const assert = require('assert')
const logging = require('./utils/logging')

const url = 'mongodb://localhost:27017'
const dbName = 'fully-hatter'

module.exports = {
    async _query(collectionName, executor) {
        const client = new MongoClient(url, { useNewUrlParser: true })
        await client.connect()
        const collection = client.db(dbName).collection(collectionName)
        const r = await executor(collection)
        await client.close()
        return r
    },
    
    async insert(collectionName, objs) {
        try {
            const r = await this._query(
                collectionName,
                async collection => collection.insertMany(objs)
            )
            assert.equal(objs.length, r.insertedCount)
            logging.info(`    L inserted ${objs.length} document(s) (collection: ${collectionName})`)
        } catch (err) {
            logging.error(`failed to insert (mongodb_driver.js)\n${err.stack}`)
        }
    },
    
    async findLikeCount(urlPath) {
        try {
            const likeCount = await this._query(
                'likes',
                async collection => collection.find({ urlPath, id: 0 }).count()
            )
            logging.info(`    L found ${likeCount} likeCount`)
            return likeCount || 0
        } catch (err) {
            logging.error(`failed to findLikeCount (mongodb_driver.js)\n${err.stack}`)
            return 0
        }
    },
    
    async findComments(filterObj) {
        try {
            const comments = await this._query(
                'comments',
                async collection => collection.find(filterObj).toArray() || []
            )
            logging.info(`    L found ${comments.length} comment(s)`)
            return comments
        } catch (err) {
            logging.error(`failed to findComments (mongodb_driver.js)\n${err.stack}`)
            return []
        }
    },
    
    async findCountsForHome() {
        const summary = {
            likeCount: {},
            commentCount: {}
        }
        
        try {
            const likeCountObjs = await this._query(
                'likes',
                async collection => collection.aggregate([
                    { $match: { id: 0 } },
                    { $group: { _id: '$urlPath', count: { $sum: 1 } } }
                ]).toArray()
            )
            logging.info(`    L found ${likeCountObjs.length} likeCounts`)
            likeCountObjs.forEach((obj) => { summary.likeCount[obj._id] = obj.count })
            
            const commentCountObjs = await this._query(
                'comments',
                async collection => collection.aggregate([
                    { $group: { _id: '$urlPath', count: { $sum: 1 } } }
                ]).toArray()
            )
            logging.info(`    L found ${commentCountObjs.length} commentCounts`)
            commentCountObjs.forEach((obj) => { summary.commentCount[obj._id] = obj.count })
        } catch (err) {
            logging.error(`failed to findCountsForHome (mongodb_driver.js)\n${err.stack}`)
        }
        return summary
    }
}
