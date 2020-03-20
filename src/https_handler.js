const qs = require('querystring')
const { parse } = require('url')
const { logging } = require('node-utils')
const mongodbDriver = require('./mongodb_driver')
const Pages = require('./pages')

const pages = new Pages()

module.exports = class HttpsHandler {
    constructor(url, mailer) {
        this.url = url
        this.mailer = mailer
    }
    
    get() {
        return async (req, res) => {
            let urlPath = parse(req.url).pathname
            const { query } = parse(req.url, true)
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            const userAgent = req.headers['user-agent']
            logging.info(`${req.method} request (url: ${urlPath}, IP Address: ${ipAddress})`)
            
            try {
                // GET
                if (req.method === 'GET') {
                    const pageNum = parseInt(query.page, 10) || 1
                    let lan
                    if (urlPath.startsWith('/en/')) {
                        // English page
                        lan = 'en'
                        urlPath = urlPath.slice(3)
                    } else {
                        // Japanese page
                        lan = 'ja'
                    }
                    
                    if (pages.has(urlPath, lan)) {
                        const html = await pages.get(urlPath, lan, pageNum)
                        res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
                        res.end(html)
                        return
                    }
                }
                
                // POST
                if (req.method === 'POST') {
                    let body = ''
                    req.on('data', (data) => { body += data })
                    
                    req.on('end', async () => {
                        const postData = qs.parse(body)
                        const urlPrefix = (postData.lan === 'en') ? '/en' : ''
                        
                        // Like
                        if (urlPath === '/post/like' && postData.key === 'furimako' && postData.lan && postData.urlPath) {
                            logging.info(`    L like (lan: ${postData.lan}, urlPath: ${postData.urlPath})`)
                            
                            const likeObjs = [{
                                urlPath: postData.urlPath,
                                date: new Date(),
                                lan: postData.lan,
                                ipAddress,
                                userAgent
                            }]
                            await mongodbDriver.insert('likes', likeObjs)
                            
                            res.writeHead(302, { Location: `${urlPrefix}${postData.urlPath}` })
                            res.end()
                            return
                        }
                        
                        // Comment
                        if (urlPath === '/post/comment' && postData.key === 'furimako' && postData.lan && postData.urlPath && postData.name && postData.comment) {
                            logging.info(`    L get comment (lan: ${postData.lan}, urlPath: ${postData.urlPath}, name: ${postData.name}, comment: ${postData.comment})`)
                            this.mailer.send(
                                `get comment from '${postData.name} (lan: ${postData.lan})'`,
                                `URL: ${this.url + ((postData.lan === 'en') ? '/en' : '') + postData.urlPath}`
                            )
                            
                            const commentObjs = [{
                                urlPath: postData.urlPath,
                                date: new Date(),
                                name: postData.name,
                                comment: postData.comment,
                                lan: postData.lan,
                                ipAddress,
                                userAgent
                            }]
                            await mongodbDriver.insert('comments', commentObjs)
                            
                            res.writeHead(302, { Location: `${urlPrefix}${postData.urlPath}#comments-field` })
                            res.end()
                            return
                        }
                        
                        // Message
                        if (urlPath === '/post/message' && postData.key === 'furimako' && postData.lan && postData.message) {
                            logging.info(`    L get message (lan: ${postData.lan}, message: ${postData.message})`)
                            this.mailer.send(
                                `get message (lan: ${postData.lan})`,
                                `${postData.message}`
                            )
                            
                            res.writeHead(302, { Location: `${urlPrefix}/` })
                            res.end()
                            return
                        }
                        
                        // invalid POST
                        logging.info(`    L get invalid POST (key: ${postData.key}, lan: ${postData.lan}, urlPath: ${postData.urlPath}, name: ${postData.name}, comment: ${postData.comment}, message: ${postData.message})`)
                        res.writeHead(400, { 'Content-Type': 'text/plain' })
                        res.end('400 Bad Request')
                    })
                    return
                }
                
                // When pages no found
                logging.info('    L responsing no-found page')
                const html = await pages.get('/no-found', 'ja')
                res.writeHead(404, { 'Content-Type': 'text/html' })
                res.end(html)
            } catch (err) {
                logging.error(`unexpected error has occurred\n${err.stack}`)
                this.mailer.send(
                    'ERROR',
                    `unexpected error has occurred\n${err.stack}`
                )
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                res.end('500 Internal Error')
            }
        }
    }
}
