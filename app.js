const fs = require('fs')
const http = require('http')
const https = require('https')
const { parse } = require('url')
const qs = require('querystring')
const { logging } = require('node-utils')

const mailgunConfig = JSON.parse(fs.readFileSync('./configs/mailgun-config.json', 'utf8'))
const title = 'Fully Hatter の秘密の部屋'
const from = '"Fully Hatter" <admin@furimako.com>'

const mailer = require('node-utils').createMailer(mailgunConfig, title, from)
const Pages = require('./src/pages')
const mongodbDriver = require('./src/mongodb_driver')

const env = process.env.NODE_ENV
const url = (env === 'production') ? 'https://furimako.com' : 'https://localhost:8129'
const pages = new Pages()


// Start HTTP server
const httpPort = 8128
const httpServer = http.createServer(
    (req, res) => {
        const urlPath = parse(req.url).pathname
        res.writeHead(302, { Location: url + urlPath })
        res.end()
        logging.info(`    L redirect from http to https (url: ${urlPath})`)
    }
)
httpServer.listen(httpPort)
logging.info(`started HTTP server (port: ${httpPort})`)

// Start HTTPS server
const httpsPort = 8129

// Certificate
let key
let cert
let ca
if (env === 'production') {
    key = fs.readFileSync('/etc/letsencrypt/live/furimako.com/privkey.pem')
    cert = fs.readFileSync('/etc/letsencrypt/live/furimako.com/cert.pem')
    ca = fs.readFileSync('/etc/letsencrypt/live/furimako.com/chain.pem')
} else {
    key = fs.readFileSync('./configs/ssl/dummy-key.pem')
    cert = fs.readFileSync('./configs/ssl/dummy-cert.pem')
}
const credentials = { key, cert, ca }
const httpsServer = https.createServer(credentials, httpsHandler)
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
            mailer.send(
                'ERROR',
                `failed to close http server\n\n${err}`
            )
            process.exit(1)
        }
    })
    httpsServer.close((err) => {
        if (err) {
            logging.error(`failed to close https server\n\n${err}`)
            mailer.send(
                'ERROR',
                `failed to close https server\n\n${err}`
            )
            process.exit(1)
        }
    })
})

async function httpsHandler(req, res) {
    const urlPath = parse(req.url).pathname
    const { query } = parse(req.url, true)
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    logging.info(`${req.method} request (url: ${urlPath}, IP Address: ${ipAddress})`)
    
    try {
        // GET
        if (req.method === 'GET' && pages.has(urlPath)) {
            const pageNum = parseInt(query.page, 10) || 1
            const html = await pages.get(urlPath, pageNum)
            res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
            res.end(html)
            return
        }
        
        // POST
        if (req.method === 'POST') {
            let body = ''
            req.on('data', (data) => { body += data })
            
            req.on('end', async () => {
                const postData = qs.parse(body)
                
                // Like
                if (urlPath === '/post/like' && postData.urlPath) {
                    logging.info(`    L like (urlPath: ${postData.urlPath})`)
                    
                    const likeObjs = [{
                        urlPath: postData.urlPath,
                        date: new Date(),
                        ipAddress,
                        userAgent
                    }]
                    await mongodbDriver.insert('likes', likeObjs)
                    
                    const html = await pages.get(postData.urlPath)
                    res.writeHead(200, { 'Content-Type': pages.contentType(postData.urlPath) })
                    res.end(html)
                    return
                }
                
                // Comment
                if (urlPath === '/post/comment' && postData.urlPath && postData.name && postData.comment) {
                    logging.info(`    L get comment (urlPath: ${postData.urlPath}, name: ${postData.name}, comment: ${postData.comment})`)
                    mailer.send(
                        `get comment from '${postData.name}'`,
                        `URL: ${url + postData.urlPath}`
                    )
                    
                    const commentObjs = [{
                        urlPath: postData.urlPath,
                        date: new Date(),
                        name: postData.name,
                        comment: postData.comment,
                        ipAddress,
                        userAgent
                    }]
                    await mongodbDriver.insert('comments', commentObjs)
                    
                    res.writeHead(302, { Location: `${postData.urlPath}#comments-field` })
                    res.end()
                    return
                }
                
                // Message
                if (urlPath === '/post/message' && postData.message) {
                    logging.info(`    L get message (message: ${postData.message})`)
                    mailer.send(
                        'get message',
                        `${postData.message}`
                    )
                    const html = await pages.get('/')
                    res.writeHead(200, { 'Content-Type': pages.contentType('/') })
                    res.end(html)
                    return
                }
                
                // invalid POST
                logging.info(`    L get invalid POST (id: ${postData.id}, name: ${postData.name}, comment: ${postData.comment}, message: ${postData.message})`)
                res.writeHead(400, { 'Content-Type': 'text/plain' })
                res.end('400 Bad Request')
            })
            return
        }
        
        // When pages no found
        logging.info('    L responsing no-found page')
        const html = await pages.get('/no-found')
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end(html)
    } catch (err) {
        logging.error(`unexpected error has occurred\n${err.stack}`)
        mailer.send(
            'ERROR',
            `unexpected error has occurred\n${err.stack}`
        )
        process.exit(1)
    }
}
