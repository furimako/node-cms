const fs = require('fs')
const http = require('http')
const https = require('https')
const parse = require('url').parse
const qs = require('querystring')
const logging = require('./js/logging')
const mailer = require('./js/mailer')
const Pages = require('./js/pages')
const mongodbDriver = require('./js/mongodb_driver')
let pages = new Pages()

const json_css = fs.readFileSync('./js/views/views-css.json', 'utf8')
const json_images = fs.readFileSync('./js/views/views-images.json', 'utf8')
const json_world = fs.readFileSync('./js/views/views-world.json', 'utf8')
const json_story = fs.readFileSync('./js/views/views-story.json', 'utf8')
const json = fs.readFileSync('./js/views/views.json', 'utf8')
pages.add(JSON.parse(json_css))
pages.add(JSON.parse(json_images))
pages.add(JSON.parse(json_world), 'world')
pages.add(JSON.parse(json_story), 'story')
pages.add(JSON.parse(json))


// Start HTTP server
const HTTP_PORT = 8128
http.createServer(httpRequestListener).listen(HTTP_PORT)
logging.info(`started server (port: ${HTTP_PORT})`)

// Start HTTPS server
const HTTPS_PORT = 8129
let options = {
    key: fs.readFileSync('./config/ssl/dummy-key.pem'),
    cert: fs.readFileSync('./config/ssl/dummy-cert.pem')
}
https.createServer(
    options,
    (req, res) => {
        let urlPath = parse(req.url).pathname
        res.writeHead(302, { Location: 'http://furimako.com' + urlPath })
        res.end()
        logging.info(`    L redirect from https to http (url: ${urlPath})`)
    }
).listen(HTTPS_PORT)


function httpRequestListener(req, res) {
    let urlPath = parse(req.url).pathname

    if (!pages.has(urlPath)) {
        // When pages no found
        logging.info(`get no-found page request (url: ${urlPath})`)
        res.writeHead(404, { 'Content-Type': 'text/html' })
        pages.get('/no-found', (page) => { res.end(page) })
        return
    }
    
    if (req.method === 'GET') {
        logging.info(`get GET request (url: ${urlPath})`)
        res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
        pages.get(urlPath, (page) => { res.end(page) })
        return
    }
    
    if (req.method === 'POST') {
        logging.info(`get POST request (url: ${urlPath})`)
        
        let body = ''
        req.on('data', (data) => { body += data })

        req.on('end', () => {
            const postData = qs.parse(body)
            if (postData.id) {
                // Like
                logging.info(`    L like (id: ${postData.id})`)
                mongodbDriver.insertLike(urlPath, parseInt(postData.id, 10))
                res.writeHead(302, { Location: urlPath })

            } else {
                // Comment
                logging.info(`    L get message (name: ${postData.name}, comment: ${postData.comment})`)
                mailer.send(
                    `[Fully Hatter の秘密の部屋] get comment from '${postData.name}'`,
                    `Target: ${pages.title(urlPath)}\nURL: ${urlPath}`
                )
                mongodbDriver.insertComment(urlPath, postData)
                res.writeHead(302, { Location: urlPath + '#comments-field' })
            }
            pages.get(urlPath, (page) => { res.end(page) })
        })

        logging.info('    L redirect')
    }
}
