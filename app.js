const fs = require('fs')
const http = require('http')
const https = require('https')
const { parse } = require('url')
const { logging } = require('node-utils')

const mailgunConfig = JSON.parse(fs.readFileSync('./configs/mailgun-config.json', 'utf8'))
const title = 'Fully Hatter の秘密の部屋'
const from = '"Fully Hatter" <admin@furimako.com>'
const mailer = require('node-utils').createMailer(mailgunConfig, title, from)
const HttpsHandler = require('./src/https_handler')


const env = process.env.NODE_ENV
const url = (env === 'production') ? 'https://furimako.com' : 'https://localhost:8129'
const httpsHandler = new HttpsHandler(url, mailer)


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
const httpsServer = https.createServer(credentials, httpsHandler.get())
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
