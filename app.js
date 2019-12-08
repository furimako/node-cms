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

async function httpHandler(req, res) {
    const urlPath = parse(req.url).pathname
    const { query } = parse(req.url, true)
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    logging.info(`${req.method} request (url: ${urlPath}, IP Address: ${ipAddress})`)
    
    try {
        if (!pages.has(urlPath)) {
        // When pages no found
            logging.info('    L responsing no-found page')
            const html = await pages.get('/no-found')
            res.writeHead(404, { 'Content-Type': 'text/html' })
            res.end(html)
            return
        }
        
        if (req.method === 'GET') {
            const numOfComments = parseInt(query.numOfComments, 10) || 5
            const html = await pages.get(urlPath, numOfComments)
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
                        date: new Date(),
                        ipAddress,
                        userAgent
                    }]
                    await mongodbDriver.insert('likes', likeObjs)
                    
                    const html = await pages.get(urlPath)
                    res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
                    res.end(html)
                    return
                }
                
                // Comment
                if (postData.name && postData.comment && postData.secretKey === 'The essential is invisible to the eyes.') {
                    logging.info(`    L get message (name: ${postData.name}, comment: ${postData.comment})`)
                    mailer.send(
                        `get comment from '${postData.name}'`,
                        `Target: ${url + urlPath}\nURL: ${urlPath}`
                    )
                    
                    const commentObjs = [{
                        urlPath,
                        date: new Date(),
                        name: postData.name,
                        comment: postData.comment,
                        ipAddress,
                        userAgent
                    }]
                    await mongodbDriver.insert('comments', commentObjs)
                    
                    res.writeHead(302, { Location: `${urlPath}#comments-field` })
                    res.end()
                    return
                }
                
                // invalid POST
                logging.info(`    L get unexpected message (id: ${postData.id}, name: ${postData.name}, secretKey: ${postData.secretKey}), comment: ${postData.comment})`)
                res.writeHead(400, { 'Content-Type': 'text/plain' })
                res.end('400 Bad Request')
            })
        }
    } catch (err) {
        logging.error(`unexpected error has occurred\n${err.stack}`)
        mailer.send(
            'ERROR',
            `unexpected error has occurred\n${err.stack}`
        )
        process.exit(1)
    }
}
