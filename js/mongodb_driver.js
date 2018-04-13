const MongoClient = require('mongodb').MongoClient
const mongoUrl = 'mongodb://localhost:27017/fully-hatter'
const logging = require('./logging')

module.exports = {
    insertComment: (urlPath, postData) => {
        let objArray = [{
            urlPath,
            date: new Date(),
            name: postData.name,
            comment: postData.comment
        }]
        insertMany(objArray, 'comments')
    },
    findComments: (urlPath, callback) => {
        findComments(urlPath, callback)
    },
    insertCount: (urlPath, id) => {
        let objArray = [{
            urlPath,
            id,
            date: new Date()
        }]
        insertMany(objArray, 'counts')
    },
    findCounts: (urlPath, callback) => {
        findCounts(urlPath, callback)
    }
}

let connect = (callback) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if (err) {
            logging.error(`failed to connect DB\n${err}`)
            return
        }
        logging.info('    L connected successfully to server')
        callback(db)
    })
}

let insertMany = (objArray, collectionStr) => {
    connect((db) => {
        let collection = db.db('fully-hatter').collection(collectionStr)
        collection.insertMany(objArray, (err, result) => {
            if (err || result.result.n !== 1 || result.ops.length !== 1) {
                logging.error(`failed to insertMany\n${err}`)
                return
            }
            logging.info(`    L inserted ${objArray.length} document(s) into the collection ${collectionStr}`)
            db.close()
        })
    })
}

let findComments = (urlPath, callback) => {
    connect((db) => {
        let collection = db.db('fully-hatter').collection('comments')
        collection.find({ urlPath }).toArray((err, docs) => {
            if (err) {
                logging.error(`failed to findComments\n${err}`)
                return
            }
            logging.info(`    L found ${docs.length} comment(s)`)
            docs.sort(
                (commentObj1, commentObj2) => commentObj1.date.getTime() - commentObj2.date.getTime()
            )
            db.close()
            callback(docs)
        })
    })
}

let findCounts = (urlPath, callback) => {
    connect((db) => {
        let countArray = []
        let collection = db.db('fully-hatter').collection('counts')
        collection.find({ urlPath }).toArray((err, docs) => {
            if (err) {
                logging.error(`failed to findCounts\n${err}`)
                return
            }
            logging.info(`    L found ${docs.length} count(s)`)
            for (let doc of docs) {
                countArray[doc.id] = (countArray[doc.id]) ? countArray[doc.id] + 1 : 1
            }
            db.close()
            callback(countArray)
        })
    })
}
