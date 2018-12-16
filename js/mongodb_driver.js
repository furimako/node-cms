const { MongoClient } = require('mongodb')

const mongoUrl = 'mongodb://localhost:27017/fully-hatter'
const logging = require('./logging')

module.exports = {
    insertLike: (urlPath, id) => {
        const like = [{
            urlPath,
            id,
            date: new Date()
        }]
        insertMany(like, 'likes')
    },
    findLike: (urlPath, callback) => { findLike(urlPath, callback) },
    findLikesForHome: (callback) => { findLikesForHome(callback) },
    insertComment: (urlPath, postData) => {
        const comments = [{
            urlPath,
            date: new Date(),
            name: postData.name,
            comment: postData.comment
        }]
        insertMany(comments, 'comments')
    },
    findComments: (urlPath, callback) => { findComments(urlPath, callback) }
}

const connect = (callback) => {
    MongoClient.connect(mongoUrl, { useNewUrlParser: true }, (err, db) => {
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
        const collection = db.db('fully-hatter').collection(collectionStr)
        collection.insertMany(objs, (err, result) => {
            if (err || result.result.n !== 1 || result.ops.length !== 1) {
                logging.error(`failed to insertMany\n${err}`)
                return
            }
            logging.info(`    L inserted ${objs.length} document(s) (collection: ${collectionStr})`)
            db.close()
        })
    })
}

let findLike = (urlPath, callback) => {
    connect((db) => {
        const collection = db.db('fully-hatter').collection('likes')
        collection.find({ urlPath, id: 0 }).count((err, pageLike) => {
            if (err) {
                logging.error(`failed to findLike\n${err}`)
                return
            }
            logging.info(`    L found ${pageLike} pageLike`)
            db.close()
            callback(pageLike)
        })
    })
}

let findLikesForHome = (callback) => {
    connect((db) => {
        const summary = {}
        summary.likeCount = {}
        summary.commentCount = {}
        
        const collectionLikes = db.db('fully-hatter').collection('likes')
        collectionLikes.aggregate([
            { $match: { id: 0 } },
            { $group: { _id: '$urlPath', count: { $sum: 1 } } }
        ]).toArray((err1, likes) => {
            if (err1) {
                logging.error(`failed to findLikesForHome (likes)\n${err1}`)
                return
            }
            logging.info(`    L found ${likes.length} likes (findLikesForHome)`)
            likes.forEach((like) => { summary.likeCount[like._id] = like.count })
            
            const collectionComments = db.db('fully-hatter').collection('comments')
            collectionComments.aggregate([
                { $group: { _id: '$urlPath', count: { $sum: 1 } } }
            ]).toArray((err2, comments) => {
                if (err2) {
                    logging.error(`failed to findLikesForHome (comments)\n${err2}`)
                    return
                }
                logging.info(`    L found ${comments.length} comments (findLikesForHome)`)
                comments.forEach((comment) => { summary.commentCount[comment._id] = comment.count })
                db.close()
                callback(summary)
            })
        })
    })
}

let findComments = (urlPath, callback) => {
    connect((db) => {
        const collection = db.db('fully-hatter').collection('comments')
        collection.find({ urlPath }).toArray((err, docs) => {
            if (err) {
                logging.error(`failed to findComments\n${err}`)
                return
            }
            logging.info(`    L found ${docs.length} comment(s)`)
            docs.sort((commentObj1, commentObj2) => commentObj1.date.getTime() - commentObj2.date.getTime())
            db.close()
            callback(docs)
        })
    })
}
