const fs = require('fs')
const http = require('http')
const https = require('https')
const { parse } = require('url')
const qs = require('querystring')

const logging = require('./server/logging')
const mailer = require('./server/mailer')
const Pages = require('./server/pages')
const MongodbDriver = require('./server/mongodb_driver')

const env = process.env.NODE_ENV
const url = (env === 'production') ? 'http://furimako.com' : 'http://localhost:8128'
const mongodbDriver = new MongodbDriver(env)
const pages = new Pages(env, url)
const viewsCSS = fs.readFileSync('./client/views/views-css.json', 'utf8')
const viewsImages = fs.readFileSync('./client/views/views-images.json', 'utf8')
const viewsWorld = fs.readFileSync('./client/views/views-world.json', 'utf8')
const viewsStory = fs.readFileSync('./client/views/views-story.json', 'utf8')
const views = fs.readFileSync('./client/views/views.json', 'utf8')
pages.add(JSON.parse(viewsCSS))
pages.add(JSON.parse(viewsImages))
pages.add(JSON.parse(viewsWorld), 'world')
pages.add(JSON.parse(viewsStory), 'story')
pages.add(JSON.parse(views))


// Start HTTP server
const httpPort = 8128
const httpServer = http.createServer(httpRequestListener)
httpServer.listen(httpPort)
logging.info(`started HTTP server (port: ${httpPort})`)

// Start HTTPS server
const httpsPort = 8129
const options = {
    key: fs.readFileSync('./configs/ssl/dummy-key.pem'),
    cert: fs.readFileSync('./configs/ssl/dummy-cert.pem')
}
const httpsServer = https.createServer(
    options,
    (req, res) => {
        const urlPath = parse(req.url).pathname
        res.writeHead(302, { Location: url + urlPath })
        res.end()
        logging.info(`    L redirect from https to http (url: ${urlPath})`)
    }
)
httpsServer.listen(httpsPort)
logging.info(`started HTTPS server (port: ${httpsPort})`)

// Send mail for confirmation
mailer.send(
    'start-up server',
    `start-up server on ${url}`,
    env
)

// When app finished
process.on('SIGINT', () => {
    logging.info('stop app (SIGINT signal received)')
    httpServer.close((err) => {
        if (err) {
            logging.error(`failed to close http server\n\n${err}`, env)
            process.exit(1)
        }
    })
    httpsServer.close((err) => {
        if (err) {
            logging.error(`failed to close https server\n\n${err}`, env)
            process.exit(1)
        }
    })
})


async function httpRequestListener(req, res) {
    const urlPath = parse(req.url).pathname

    if (!pages.has(urlPath)) {
        // When pages no found
        logging.info(`get no-found page request (url: ${urlPath})`)
        res.writeHead(404, { 'Content-Type': 'text/html' })
        const html = await pages.get('/no-found')
        res.end(html)
        return
    }
    
    if (req.method === 'GET') {
        logging.info(`get GET request (url: ${urlPath})`)
        res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
        const html = await pages.get(urlPath)
        res.end(html)
        return
    }
    
    if (req.method === 'POST') {
        logging.info(`get POST request (url: ${urlPath})`)
        
        let body = ''
        req.on('data', (data) => { body += data })

        req.on('end', async () => {
            const postData = qs.parse(body)
            if (postData.id) {
                // Like
                logging.info(`    L like (id: ${postData.id})`)
                
                const likeObjs = [{
                    urlPath,
                    id: parseInt(postData.id, 10),
                    date: new Date()
                }]
                mongodbDriver.insert('likes', likeObjs)
                
                res.writeHead(302, { Location: urlPath })
            } else if (postData.name && postData.comment) {
                // Comment
                logging.info(`    L get message (name: ${postData.name}, comment: ${postData.comment})`)
                mailer.send(
                    `get comment from '${postData.name}'`,
                    `Target: ${pages.title(urlPath)}\nURL: ${urlPath}`,
                    env
                )
                
                const commentObjs = [{
                    urlPath,
                    date: new Date(),
                    name: postData.name,
                    comment: postData.comment
                }]
                mongodbDriver.insert('comments', commentObjs)
                
                res.writeHead(302, { Location: `${urlPath}#comments-field` })
            } else {
                // unexpected
                logging.info(`    L get unexpected message (id: ${postData.id}, name: ${postData.name}, comment: ${postData.comment})`)
            }

            const html = await pages.get(urlPath)
            res.end(html)
        })

        logging.info('    L redirect')
    }
}
