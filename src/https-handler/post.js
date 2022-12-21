const https = require('https')
const qs = require('querystring')
const { parse } = require('url')
const { logging } = require('node-utils')
const mongodbDriver = require('../mongodb_driver')
const Pages = require('../pages')
const reCAPTCHAConfig = require('../../configs/configs').reCAPTCHA

const pages = new Pages()

module.exports = async function post(req, res, options) {
    const { url, mailer } = options

    const urlPath = parse(req.url).pathname
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    logging.info(`    L url: ${urlPath}, IP Address: ${ipAddress} (${url})`)

    let body = ''
    req.on('data', (data) => { body += data })
    
    req.on('end', async () => {
        const postData = qs.parse(body)
        const urlPrefix = (postData.lan === 'en') ? '/en' : ''

        // Like
        if (urlPath === '/post/like' && postData.key === 'furimako' && pages.has(postData.urlPath) && postData.lan) {
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
        if (urlPath === '/post/comment' && postData.key === 'furimako' && pages.has(postData.urlPath) && postData.lan && postData.name && postData.comment) {
            logging.info(`    L get comment (lan: ${postData.lan}, urlPath: ${postData.urlPath}, name: ${postData.name}, comment: ${postData.comment})`)
            mailer.send({
                subject: `get comment from '${postData.name}' (lan: ${postData.lan})`,
                text: `urlPath: ${postData.urlPath}\nURL: ${url + ((postData.lan === 'en') ? '/en' : '') + postData.urlPath}`
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
            res.writeHead(302, { Location: `${urlPrefix}${postData.urlPath}#comments-form` })
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
                
                mailer.send({
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
                
                res.writeHead(302, { Location: `/?registration=MAIL_SENT&email=${qs.escape(postData.email)}` })
                res.end()
                return
            }
            
            if (residentStatus === 'PRE_REGISTERED') {
                res.writeHead(302, { Location: `/?registration=ALREADY_PRE_REGISTERED&email=${qs.escape(postData.email)}` })
                res.end()
                return
            }
            
            if (residentStatus === 'REGISTERED') {
                res.writeHead(302, { Location: `/?registration=ALREADY_REGISTERED&email=${qs.escape(postData.email)}` })
                res.end()
                return
            }
            
            throw new Error(`should not be here (residentStatus: ${residentStatus})`)
        }

        // Google reCAPTCHA
        const recaptchaClientRes = postData['g-recaptcha-response']
        if (recaptchaClientRes === undefined || recaptchaClientRes === '' || recaptchaClientRes === null) {
            logging.info(`    L failed to select captcha (recaptchaClientRes: ${recaptchaClientRes})`)
            _updateResWith400(res, postData)
            return
        }
        const recaptchaOptions = {
            hostname: 'www.google.com',
            port: 443,
            path: `/recaptcha/api/siteverify?secret=${reCAPTCHAConfig.secret}&response=${recaptchaClientRes}&remoteip=${ipAddress}`,
            method: 'GET'
        }
        const recaptchaServerReq = https.request(recaptchaOptions, (recaptchaServerRes) => {
            logging.info(`    L statusCode: ${recaptchaServerRes.statusCode}, headers: ${JSON.stringify(recaptchaServerRes.headers)}`)
            let recaptchaBody = ''
            recaptchaServerRes.on('data', (data) => {
                recaptchaBody += data
            })
            recaptchaServerRes.on('end', async () => {
                if (!recaptchaBody) {
                    logging.info(`    L recaptcha failed (recaptchaBody: ${recaptchaBody})`)
                    _updateResWith400(res, postData)
                    return
                }

                const recaptchaData = JSON.parse(recaptchaBody)
                if (!recaptchaData.success) {
                    logging.info(`    L recaptcha failed (recaptchaData: ${JSON.stringify(recaptchaData)})`)
                    _updateResWith400(res, postData)
                    return
                }

                logging.info(`    L recaptcha succeeded (recaptchaData: ${JSON.stringify(recaptchaData)})`)

                // Message
                if (urlPath === '/post/message' && postData.key === 'furimako' && postData.lan && postData.message) {
                    logging.info(`    L get message (lan: ${postData.lan}, message: ${postData.message})`)
                    mailer.send({
                        subject: `get message (lan: ${postData.lan})`,
                        text: `${postData.message}`
                    })
            
                    res.writeHead(302, { Location: `${urlPrefix}/?messageSent=true` })
                    res.end()
                    return
                }

                // invalid POST
                _updateResWith400(res, postData)
            })
        })
        recaptchaServerReq.on('error', (error) => {
            logging.info(`    L recaptcha error (error: ${error})`)
            _updateResWith400(res, postData, error)
        })
        recaptchaServerReq.end()
    })
}

function _updateResWith400(res, postData, error) {
    logging.info(`    L get invalid POST (error: ${error}, postData: ${JSON.stringify(postData)})`)
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end('400 Bad Request')
}
