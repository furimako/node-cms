const MongoClient = require('mongodb').MongoClient
const mongoUrl = 'mongodb://localhost:27017/fully-hatter'
const logging = require('./logging')

module.exports = {
    insertComment: (urlPath, postData) => {
        let comments = [{
            urlPath,
            date: new Date(),
            name: postData.name,
            comment: postData.comment
        }]
        insertMany(comments, 'comments')
    },
    findComments: (urlPath, callback) => {
        findComments(urlPath, callback)
    },
    insertLike: (urlPath, id) => {
        let like = [{
            urlPath,
            id,
            date: new Date()
        }]
        insertMany(like, 'likes')
    },
    findLikes: (urlPath, callback) => {
        findLikes(urlPath, callback)
    },
    findPageLikes: (urlPath, callback) => {
        findPageLikes(urlPath, callback)
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

let insertMany = (objs, collectionStr) => {
    connect((db) => {
        let collection = db.db('fully-hatter').collection(collectionStr)
        collection.insertMany(objs, (err, result) => {
            if (err || result.result.n !== 1 || result.ops.length !== 1) {
                logging.error(`failed to insertMany\n${err}`)
                return
            }
            logging.info(`    L inserted ${objs.length} document(s) into the collection ${collectionStr}`)
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

let findLikes = (urlPath, callback) => {
    connect((db) => {
        let likes = []
        let collection = db.db('fully-hatter').collection('likes')
        collection.find({ urlPath }).toArray((err, docs) => {
            if (err) {
                logging.error(`failed to findLikes\n${err}`)
                return
            }
            logging.info(`    L found ${docs.length} like(s)`)
            for (let doc of docs) {
                likes[doc.id] = (likes[doc.id]) ? likes[doc.id] + 1 : 1
            }
            db.close()
            callback(likes)
        })
    })
}

let findPageLikes = (urlPath, callback) => {
    connect((db) => {
        let collection = db.db('fully-hatter').collection('likes')
        collection.find({ urlPath, id: 0 }).count((err, pageLike) => {
            if (err) {
                logging.error(`failed to findPageLikes\n${err}`)
                return
            }
            logging.info(`    L found ${pageLike} page like(s)`)
            db.close()
            callback(pageLike)
        })
    })
}
