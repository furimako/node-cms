const fs = require('fs')
const http = require('http')
const https = require('https')
const { parse } = require('url')
const logging = require('./src/utils/logging')
const Mailer = require('./src/utils/mailer')
const acmeChallenge = require('./src/acme_challenge')
const HttpsHandler = require('./src/https-handler/main')
const mongodbDriver = require('./src/mongodb_driver')
const smtpConfig = require('./configs/configs').smtp

const mailer = new Mailer(
    smtpConfig,
    {
        title: 'Fully Hatter の秘密の部屋',
        defaultFrom: '"Fully Hatter" <fully-hatter@furimako.com>',
        defaultTo: 'furimako@gmail.com'
    }
)
const env = process.env.NODE_ENV
const homeUrl = (env === 'production') ? 'https://furimako.com' : 'https://localhost:8129'

;(async () => {
    const httpsHandler = new HttpsHandler(homeUrl, mailer)
    let key
    let cert
    let ca
    if (env === 'production') {
        // placed by scripts/production/certbot-deploy-hook.sh
        let sslDir = './configs/production/ssl'
        if (!fs.existsSync(`${sslDir}/privkey.pem`)) {
            // before the deploy hook has been executed for the first time
            sslDir = '/etc/letsencrypt/live/furimako.com'
            logging.info(`certificate no found in ./configs/production/ssl (fallback: ${sslDir})`)
        }
        key = fs.readFileSync(`${sslDir}/privkey.pem`)
        cert = fs.readFileSync(`${sslDir}/cert.pem`)
        ca = fs.readFileSync(`${sslDir}/chain.pem`)
        const numOfPreResident = await mongodbDriver.count('registrations', { residentStatus: 'PRE_REGISTERED' })
        const numOfResident = await mongodbDriver.count('registrations', { residentStatus: 'REGISTERED' })
        mailer.send({
            subject: 'start-up server',
            text: `start-up server on ${homeUrl}\n\n`
                + `pre-resident: ${numOfPreResident}\n`
                + `resident: ${numOfResident}`
        })
    } else {
        key = fs.readFileSync('./configs/local/ssl/dummy-key.pem')
        cert = fs.readFileSync('./configs/local/ssl/dummy-cert.pem')
    }
    const credentials = { key, cert, ca }

    // Start HTTPS server
    const httpsPort = 8129
    const httpsServer = https.createServer(credentials, httpsHandler.create())
    httpsServer.on('clientError', (err, socket) => { socket.destroy() })
    httpsServer.listen(httpsPort)
    logging.info(`started HTTPS server ${homeUrl} (port: ${httpsPort})`)

    // Start HTTP server
    const httpPort = 8128
    const httpServer = http.createServer(
        (req, res) => {
            const urlPath = parse(req.url).pathname

            // for certbot (respond without redirecting to https)
            if (acmeChallenge.isAcmeChallenge(urlPath) && acmeChallenge.respond(res, urlPath)) {
                return
            }

            res.writeHead(302, { Location: homeUrl + urlPath })
            res.end()
            logging.info(`    L redirect from http to https (url: ${urlPath})`)
        }
    )
    httpServer.on('clientError', (err, socket) => { socket.destroy() })
    httpServer.listen(httpPort)
    logging.info(`started HTTP server (port: ${httpPort})`)

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
})()
