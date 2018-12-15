const fs = require('fs')
const http = require('http')
const https = require('https')
const parse = require('url').parse
const qs = require('querystring')

const logging = require('./js/logging')
const mailer = require('./js/mailer')
const Pages = require('./js/pages')
const mongodbDriver = require('./js/mongodb_driver')

const url = 'http://furimako.com'
let pages = new Pages(url)
const viewsCSS = fs.readFileSync('./static/views/views-css.json', 'utf8')
const viewsImages = fs.readFileSync('./static/views/views-images.json', 'utf8')
const viewsWorld = fs.readFileSync('./static/views/views-world.json', 'utf8')
const viewsStory = fs.readFileSync('./static/views/views-story.json', 'utf8')
const views = fs.readFileSync('./static/views/views.json', 'utf8')
pages.add(JSON.parse(viewsCSS))
pages.add(JSON.parse(viewsImages))
pages.add(JSON.parse(viewsWorld), 'world')
pages.add(JSON.parse(viewsStory), 'story')
pages.add(JSON.parse(views))


// Start HTTP server
const httpPort = 8128
http.createServer(httpRequestListener).listen(httpPort)
logging.info(`started server (port: ${httpPort})`)

// Start HTTPS server
const httpsPort = 8129
let options = {
    key: fs.readFileSync('./config/ssl/dummy-key.pem'),
    cert: fs.readFileSync('./config/ssl/dummy-cert.pem')
}
https.createServer(
    options,
    (req, res) => {
        let urlPath = parse(req.url).pathname
        res.writeHead(302, { Location: url + urlPath })
        res.end()
        logging.info(`    L redirect from https to http (url: ${urlPath})`)
    }
).listen(httpsPort)

// Send mail for confirmation
mailer.send(
    '[Fully Hatter の秘密の部屋] start-up server',
    `start-up server on ${url}`
)


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

            } else if (postData.name && postData.comment) {
                // Comment
                logging.info(`    L get message (name: ${postData.name}, comment: ${postData.comment})`)
                mailer.send(
                    `[Fully Hatter の秘密の部屋] get comment from '${postData.name}'`,
                    `Target: ${pages.title(urlPath)}\nURL: ${urlPath}`
                )
                mongodbDriver.insertComment(urlPath, postData)
                res.writeHead(302, { Location: urlPath + '#comments-field' })
                
            } else {
                // unexpected
                logging.info(`    L get unexpected message (id: ${postData.id}, name: ${postData.name}, comment: ${postData.comment})`)
            }

            pages.get(urlPath, (page) => { res.end(page) })
        })

        logging.info('    L redirect')
    }
}
