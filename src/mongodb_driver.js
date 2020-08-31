const { MongoClient } = require('mongodb')
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
    
    async insertOne(collectionName, obj) {
        const r = await this._query(
            collectionName,
            async (collection) => collection.insertOne(obj)
        )
        logging.info(`    L inserted 1 document (collection: ${collectionName}, _id: ${r.insertedId})`)
        return r
    },
    
    async count(collectionName, filterObj) {
        const count = await this._query(
            collectionName,
            async (collection) => collection.find(filterObj).count()
        )
        logging.info(`    L found ${count} count (collection: ${collectionName}, filterObj: ${JSON.stringify(filterObj)})`)
        return count || 0
    },
    
    async findOne(collectionName, filterObj) {
        const documentObj = await this._query(
            collectionName,
            async (collection) => collection.findOne(filterObj)
        )
        logging.info(`    L findOne (collection: ${collectionName}, filterObj: ${JSON.stringify(filterObj)}, documentObj: ${JSON.stringify(documentObj)})`)
        return documentObj
    },
    
    async find(collectionName, filterObj) {
        const result = await this._query(
            collectionName,
            async (collection) => collection.find(filterObj).toArray() || []
        )
        logging.info(`    L found ${result.length} comment(s) (collection: ${collectionName}, filterObj: ${JSON.stringify(filterObj)})`)
        return result
    },
    
    async updateOne(collectionName, filterObj, setObj) {
        const result = await this._query(
            collectionName,
            async (collection) => collection.updateOne(filterObj, { $set: setObj })
        )
        logging.info(`    L update 1 document (collection: ${collectionName}, filterObj: ${JSON.stringify(filterObj)}, matchedCount: ${result.matchedCount}, modifiedCount: ${result.modifiedCount})`)
        return result
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
        logging.info(`    L found ${likeCountObjs.length} likeCounts (lan: ${lan})`)
        likeCountObjs.forEach((obj) => { summary.likeCount[obj._id] = obj.count })
            
        const commentCountObjs = await this._query(
            'comments',
            async (collection) => collection.aggregate([
                { $match: { lan } },
                { $group: { _id: '$urlPath', count: { $sum: 1 } } }
            ]).toArray()
        )
        logging.info(`    L found ${commentCountObjs.length} commentCounts (lan: ${lan})`)
        commentCountObjs.forEach((obj) => { summary.commentCount[obj._id] = obj.count })
        return summary
    }
}
