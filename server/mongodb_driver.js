const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const mongoUrl = 'mongodb://localhost:27017/fully-hatter'
const logging = require('./logging')

module.exports = {
    insert: (urlPath, postData) => {
        MongoClient.connect(mongoUrl, (err, db) => {
            assert.equal(null, err)
            logging.info('    L connected successfully to server')
            insertCommentToDB(urlPath, postData, db, () => { db.close() })
        })
    }
}


let insertCommentToDB = (urlPath, postData, db, callback) => {
    let objList = [
        {
            urlPath,
            date: new Date(),
            name: postData.name,
            comment: postData.comment
        },
    ]

    const collectionStr = 'comments'
    let collection = db.db('fully-hatter').collection(collectionStr)
    collection.insertMany(objList, (err, result) => {
        assert.equal(err, null)
        assert.equal(1, result.result.n)
        assert.equal(1, result.ops.length)
        logging.info(`    L inserted ${objList.length} document(s) into the collection ${collectionStr}`)
        callback(result)
    })
}
