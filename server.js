const fs = require('fs')
const http = require('http')
const url = require('url')
const qs = require('querystring')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const mongoUrl = 'mongodb://localhost:27017/fully-hatter'
const logging = require('./js/logging')
const Pages = require('./js/pages')


let pages = new Pages()

const json = fs.readFileSync('./data/views.json', 'utf8')
const views = JSON.parse(json)
pages.add(views)

const json_world = fs.readFileSync('./data/views-world.json', 'utf8')
const views_world = JSON.parse(json_world)
pages.add(views_world)

const json_story = fs.readFileSync('./data/views-story.json', 'utf8')
const views_story = JSON.parse(json_story)
pages.add(views_story)


// Start server
const server = http.createServer(requestListener)
let port = 8128
server.listen(port)
logging.info(`started server (port: ${port})`)


function requestListener(request, response) {
    logging.info(`get request (url: ${request.url})`)
    let urlPath = url.parse(request.url, true).pathname

    if (pages.has(urlPath)) {
        if (urlPath.endsWith('/comment') && request.method == 'POST') {
            urlPath = urlPath.slice(0, -8)

            // POST
            let body = ''
            request.on('data', (data) => {
                body += data
            })

            request.on('end', () => {
                const postData = qs.parse(body)
                logging.info(`    L get message [name: ${postData.name}, comment: ${postData.comment}`)

                MongoClient.connect(mongoUrl, (err, db) => {
                    assert.equal(null, err)
                    logging.info('    L connected successfully to server')
                    insertCommentToDB(urlPath, postData, db, () => { db.close() })
                })
            })
            response.writeHead(302, { Location: urlPath + '#comments-field' })
            pages.addEndToResponse(response, urlPath)
            logging.info(`    L redirect (url: ${urlPath})`)

        } else {
            // GET
            response.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
            pages.addEndToResponse(response, urlPath)
            logging.info(`    L response page (url: ${urlPath})`)
        }


    } else {
        // When pages no found
        response.writeHead(404, { 'Content-Type': 'text/html' })
        pages.addEndToResponse(response, '/no-found')
        logging.info(`    L response no-found (url: ${urlPath})`)
    }
}


let insertCommentToDB = (urlPath, postData, db, callback) => {
    let objList = [{
        urlPath,
        date: new Date(),
        name: postData.name,
        comment: postData.comment
    }]

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
