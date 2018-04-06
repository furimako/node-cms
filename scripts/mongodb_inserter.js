const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const mongoUrl = 'mongodb://localhost:27017/fully-hatter'


const objList = [
    {
        urlPath: '/',
        date: new Date('2017/08/02 05:50:00'),
        name: 'Fully Hatter',
        comment: ''
    },
    {
        urlPath: '/',
        date: new Date('2017/08/02 05:56:00'),
        name: 'Fully Hatter',
        comment: ''
    }
]


MongoClient.connect(mongoUrl, (err, db) => {
    assert.equal(null, err)
    console.log('connected successfully to server')
    insertToDB(objList, db, () => { db.close() })
})


let insertToDB = (list, db, callback) => {
    const collectionStr = 'comments'
    let collection = db.db('fully-hatter').collection(collectionStr)
    collection.insertMany(list, (err, result) => {
        assert.equal(err, null)
        console.log(`inserted ${list.length} document(s) into the collection ${collectionStr}`)
        callback(result)
    })
}
