const fs = require('fs')
const http = require('http')
const https = require('https')
const { parse } = require('url')
const qs = require('querystring')

const logging = require('./src/utils/logging')
const mailer = require('./src/utils/mailer')
const Pages = require('./src/pages')
const mongodbDriver = require('./src/mongodb_driver')

const env = process.env.NODE_ENV
const url = (env === 'production') ? 'http://furimako.com' : 'http://localhost:8128'
const pages = new Pages()


// Start HTTP server
const httpPort = 8128
const httpServer = http.createServer(httpHandler)
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
    `start-up server on ${url}`
)

// When app finished
process.on('SIGINT', () => {
    logging.info('stop app (SIGINT signal received)')
    httpServer.close((err) => {
        if (err) {
            logging.error(`failed to close http server\n\n${err}`)
            process.exit(1)
        }
    })
    httpsServer.close((err) => {
        if (err) {
            logging.error(`failed to close https server\n\n${err}`)
            process.exit(1)
        }
    })
})


async function httpHandler(req, res) {
    const urlPath = parse(req.url).pathname
    logging.info(`${req.method} request (url: ${urlPath})`)

    if (!pages.has(urlPath)) {
        // When pages no found
        logging.info('    L responsing no-found page')
        const html = await pages.get('/no-found')
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end(html)
        return
    }
    
    
    if (req.method === 'GET') {
        const html = await pages.get(urlPath)
        res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
        res.end(html)
        return
    }
    
    if (req.method === 'POST') {
        let body = ''
        req.on('data', (data) => { body += data })

        req.on('end', async () => {
            const postData = qs.parse(body)
            
            // Like
            if (postData.id) {
                logging.info(`    L like (id: ${postData.id})`)
                
                const likeObjs = [{
                    urlPath,
                    id: parseInt(postData.id, 10),
                    date: new Date()
                }]
                await mongodbDriver.insert('likes', likeObjs)
                
                const html = await pages.get(urlPath)
                res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
                res.end(html)
                return
            }
            
            // Comment
            if (postData.name && postData.comment) {
                logging.info(`    L get message (name: ${postData.name}, comment: ${postData.comment})`)
                mailer.send(
                    `get comment from '${postData.name}'`,
                    `Target: ${pages.title(urlPath)}\nURL: ${urlPath}`
                )
                
                const commentObjs = [{
                    urlPath,
                    date: new Date(),
                    name: postData.name,
                    comment: postData.comment
                }]
                await mongodbDriver.insert('comments', commentObjs)
                
                res.writeHead(302, { Location: `${urlPath}#comments-field` })
                res.end()
                return
            }
            
            // invalid POST
            logging.info(`    L get unexpected message (id: ${postData.id}, name: ${postData.name}, comment: ${postData.comment})`)
            const html = await pages.get(urlPath)
            res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
            res.end(html)
        })
    }
}
