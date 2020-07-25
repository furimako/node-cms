const qs = require('querystring')
const { parse } = require('url')
const cookie = require('cookie')
const { logging } = require('node-utils')
const mongodbDriver = require('./mongodb_driver')
const Pages = require('./pages')

const pages = new Pages()

module.exports = class HttpsHandler {
    constructor(url, mailer) {
        this.url = url
        this.mailer = mailer
    }
    
    create() {
        return async (req, res) => {
            let urlPath = parse(req.url).pathname
            const { query } = parse(req.url, true)
            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            const userAgent = req.headers['user-agent']
            logging.info(`${req.method} request (url: ${urlPath}, IP Address: ${ipAddress})`)
            
            try {
                // GET
                if (req.method === 'GET') {
                    const signedIn = false
                    // if (req.headers.cookie) {
                    //     const { email, password } = cookie.parse(req.headers.cookie)
                    //     logging.info(`    L cookies (email: ${email}, password: ${password})`)
                    //     signedIn = await mongodbDriver.checkPassword(email, password)
                    //     logging.info(`    L signedIn: ${signedIn}`)
                    // }
                    
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
                        const html = await pages.get(urlPath, lan, signedIn, pageNum)
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
                        
                        // Sign in
                        // if (urlPath === '/post/signin' && postData.key === 'furimako' && postData.email && postData.password) {
                        //     const { email, password } = postData
                        //     logging.info(`    L trying to sign-in (email: ${email}, password: ${password})`)
                        //
                        //     if (await mongodbDriver.checkPassword(email, password)) {
                        //         logging.info('    L valid password')
                        //         const cookies = []
                        //         cookies.push(cookie.serialize('email', email))
                        //         cookies.push(cookie.serialize('password', password))
                        //         logging.info(`cookies: ${cookies}`)
                        //         res.setHeader('Set-Cookie', cookies)
                        //         logging.info(`res1: ${res.getHeader('Cookie')}`)
                        //         res.writeHead(302, { Location: '/residents' })
                        //         logging.info(`res2: ${res.getHeader('Cookie')}`)
                        //         logging.info(`res3: ${res.getHeader('Location')}`)
                        //         res.end()
                        //         return
                        //     }
                        //
                        //     res.writeHead(302, { Location: '/login?failed' })
                        //     res.end()
                        //     return
                        // }
                        
                        // Like
                        if (urlPath === '/post/like' && postData.key === 'furimako' && pages.has(postData.urlPath, postData.lan)) {
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
                        if (urlPath === '/post/comment' && postData.key === 'furimako' && pages.has(postData.urlPath, postData.lan) && postData.name && postData.comment) {
                            logging.info(`    L get comment (lan: ${postData.lan}, urlPath: ${postData.urlPath}, name: ${postData.name}, comment: ${postData.comment})`)
                            this.mailer.send({
                                subject: `get comment from '${postData.name}' (lan: ${postData.lan})`,
                                text: `urlPath: ${postData.urlPath}\nURL: ${this.url + ((postData.lan === 'en') ? '/en' : '') + postData.urlPath}`
                            })
                            
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
                            this.mailer.send({
                                subject: `get message (lan: ${postData.lan})`,
                                text: `${postData.message}`
                            })
                            
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
