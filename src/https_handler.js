const qs = require('querystring')
const { parse } = require('url')
const { ObjectId } = require('mongodb')
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
                        logging.info(`    L responsing GET page (urlPath: ${urlPath}, lan: ${lan})`)
                        if (signedIn) {
                            logging.info(`        L signedIn: ${signedIn}`)
                        }
                        if (query) {
                            logging.info(`        L query: ${JSON.stringify(query)}`)
                        }
                        
                        if (query.residentId) {
                            const residentObj = await mongodbDriver.findOne(
                                'registrations',
                                { _id: ObjectId(query.residentId), residentStatus: 'PRE_REGISTERED' }
                            )
                            if (residentObj) {
                                logging.info(`    L registered (residentId: ${query.residentId}, residentObj: ${JSON.stringify(residentObj)})`)
                                
                                await mongodbDriver.updateOne(
                                    'registrations',
                                    { _id: ObjectId(query.residentId) },
                                    { residentStatus: 'REGISTERED', registeredDate: new Date() }
                                )
                                
                                this.mailer.send({
                                    from: '"Fully Hatter" <no-reply@furimako.com>',
                                    to: residentObj.email,
                                    subject: '住人登録が完了しました',
                                    headers: {
                                        'X-Mailjet-Campaign': 'Resident Registered',
                                        // 'X-Mailjet-DeduplicateCampaign': true,
                                        'X-MJ-TemplateLanguage': 1,
                                        'X-MJ-TemplateID': 1658779,
                                        'X-MJ-TemplateErrorReporting': 'furimako@gmail.com'
                                    }
                                })
                                
                                const html = await pages.get(urlPath, lan, {
                                    pageNum: parseInt(query.page, 10) || 1,
                                    signedIn,
                                    registration: { REGISTERED: true },
                                    email: residentObj.email
                                })
                                res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
                                res.end(html)
                                return
                            }
                        }
                        
                        const html = await pages.get(urlPath, lan, {
                            pageNum: parseInt(query.page, 10) || 1,
                            signedIn,
                            registration: { [query.registration]: true },
                            email: query.email
                        })
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
                        if (urlPath === '/post/like' && postData.key === 'furimako' && pages.has(postData.urlPath, postData.lan)) {
                            logging.info(`    L like (lan: ${postData.lan}, urlPath: ${postData.urlPath})`)
                            
                            const likeObj = {
                                urlPath: postData.urlPath,
                                lan: postData.lan,
                                date: new Date(),
                                ipAddress,
                                userAgent
                            }
                            await mongodbDriver.insertOne('likes', likeObj)
                            
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
                            
                            const commentObj = {
                                urlPath: postData.urlPath,
                                name: postData.name,
                                comment: postData.comment,
                                lan: postData.lan,
                                date: new Date(),
                                ipAddress,
                                userAgent
                            }
                            await mongodbDriver.insertOne('comments', commentObj)
                            
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
                        
                        // Resident Registration
                        if (urlPath === '/post/register' && postData.key === 'furimako' && postData.email) {
                            const residentObj = await mongodbDriver.findOne('registrations', { email: postData.email })
                            const residentStatus = ((residentObj)) ? residentObj.residentStatus : 'NONE'
                            logging.info(`    L resident registration (email: ${postData.email}, residentStatus: ${residentStatus})`)
                            
                            if (residentStatus === 'NONE') {
                                const registrationObj = {
                                    email: postData.email,
                                    residentStatus: 'PRE_REGISTERED',
                                    preRegisteredDate: new Date(),
                                    ipAddress,
                                    userAgent
                                }
                                const insertResult = await mongodbDriver.insertOne('registrations', registrationObj)
                                
                                this.mailer.send({
                                    from: '"Fully Hatter" <no-reply@furimako.com>',
                                    to: postData.email,
                                    subject: '住人登録を完了してください',
                                    headers: {
                                        'X-Mailjet-Campaign': 'Resident Registration',
                                        // 'X-Mailjet-DeduplicateCampaign': true,
                                        'X-MJ-TemplateLanguage': 1,
                                        'X-MJ-TemplateID': 1646405,
                                        'X-MJ-Vars': `{ "confirmation_link": "https://${(process.env.NODE_ENV === 'production') ? 'furimako.com' : 'localhost:8129'}/?residentId=${insertResult.insertedId}" }`,
                                        'X-MJ-TemplateErrorReporting': 'furimako@gmail.com'
                                    }
                                })
                                
                                res.writeHead(302, { Location: `/?registration=MAIL_SENT&email=${postData.email}` })
                                res.end()
                                return
                            }
                            
                            if (residentStatus === 'PRE_REGISTERED') {
                                res.writeHead(302, { Location: `/?registration=ALREADY_PRE_REGISTERED&email=${postData.email}` })
                                res.end()
                                return
                            }
                            
                            if (residentStatus === 'REGISTERED') {
                                res.writeHead(302, { Location: `/?registration=ALREADY_REGISTERED&email=${postData.email}` })
                                res.end()
                                return
                            }
                            
                            throw new Error(`should not be here (residentStatus: ${residentStatus})`)
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
