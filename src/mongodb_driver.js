const { MongoClient } = require('mongodb')
const assert = require('assert')
const { logging } = require('node-utils')

const url = 'mongodb://localhost:27017'
const dbName = 'node-cms'

module.exports = {
    async _query(collectionName, executor) {
        const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true })
        await client.connect()
        const collection = client.db(dbName).collection(collectionName)
        const r = await executor(collection)
        await client.close()
        return r
    },
    
    async insert(collectionName, objs) {
        const r = await this._query(
            collectionName,
            async (collection) => collection.insertMany(objs)
        )
        assert.equal(objs.length, r.insertedCount)
        logging.info(`    L inserted ${objs.length} document(s) (collection: ${collectionName})`)
    },
    
    // async checkPassword(email, password) {
    //     logging.info(`    L checking password (email: ${email}, password: ${password})`)
    //     if (email.length > 50 || password.length < 8 || password.length > 20) {
    //         logging.info('    L invalid email or password')
    //         return false
    //     }
    //
    //     const count = await this._query(
    //         'users',
    //         async (collection) => collection.find({ email, password }).count()
    //     )
    //
    //     if (count !== 0 && count !== 1) {
    //         throw new Error(`failed to checkPassword (count: ${count})`)
    //     } else {
    //         logging.info(`    L checkPassword: ${count === 1}`)
    //     }
    //     return count === 1
    // },
    
    async findLikeCount(urlPath) {
        const likeCount = await this._query(
            'likes',
            async (collection) => collection.find({ urlPath }).count()
        )
        logging.info(`    L found ${likeCount} likeCount`)
        return likeCount || 0
    },
    
    async findComments(filterObj) {
        const comments = await this._query(
            'comments',
            async (collection) => collection.find(filterObj).toArray() || []
        )
        logging.info(`    L found ${comments.length} comment(s)`)
        return comments
    },
    
    async findCountsForHome(lan) {
        const summary = {
            likeCount: {},
            commentCount: {}
        }
        
        const likeCountObjs = await this._query(
            'likes',
            async (collection) => collection.aggregate([
                { $match: {} },
                { $group: { _id: '$urlPath', count: { $sum: 1 } } }
            ]).toArray()
        )
        logging.info(`    L found ${likeCountObjs.length} likeCounts`)
        likeCountObjs.forEach((obj) => { summary.likeCount[obj._id] = obj.count })
            
        const commentCountObjs = await this._query(
            'comments',
            async (collection) => collection.aggregate([
                { $match: { lan } },
                { $group: { _id: '$urlPath', count: { $sum: 1 } } }
            ]).toArray()
        )
        logging.info(`    L found ${commentCountObjs.length} commentCounts`)
        commentCountObjs.forEach((obj) => { summary.commentCount[obj._id] = obj.count })
        return summary
    }
}
