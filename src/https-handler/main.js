const { logging } = require('node-utils')
const get = require('./get')
const post = require('./post')

module.exports = class HttpsHandler {
    constructor(url, mailer) {
        this.url = url
        this.mailer = mailer
    }
    
    create() {
        return async (req, res) => {
            logging.info(`${req.method} request`)
            
            try {
                // GET
                if (req.method === 'GET') {
                    await get(req, res, { mailer: this.mailer })
                    return
                }
                
                // POST
                if (req.method === 'POST') {
                    await post(req, res, { url: this.url, mailer: this.mailer })
                    return
                }
            } catch (err) {
                logging.error(`unexpected error has occurred\n${err.stack}`)
                this.mailer.send({
                    subject: 'ERROR',
                    text: `unexpected error has occurred\n${err.stack}`
                })
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                res.end('500 Internal Error')
            }
        }
    }
}
