const qs = require('querystring')
const { parse } = require('url')
const axios = require('axios')
const { logging } = require('node-utils')
const mongodbDriver = require('../mongodb_driver')
const Pages = require('../pages')
const recaptchaConfig = require('../../configs/configs').recaptcha
const spamTextList = require('../../configs/spam_text_list')

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
        logging.info(`    L postData: ${JSON.stringify(postData)})`)

        // Like
        if (urlPath === '/post/like' && pages.has(postData.urlPath) && postData.lan) {
            await handleLike(res, postData, ipAddress, userAgent)
            return
        }

        // Comment
        if (urlPath === '/post/comment' && pages.has(postData.urlPath) && postData.lan && postData.name && postData.comment) {
            await handleComment(res, postData, ipAddress, userAgent, url, mailer)
            return
        }
        
        // reCAPTCHA challenge
        const reCAPTCHAResult = await checkRequest(postData['g-recaptcha-response'])
        if (!reCAPTCHAResult) {
            updateResWith400(res, postData)
            return
        }

        // Message
        if (urlPath === '/post/fmessage' && postData.lan && postData.message) {
            await handleMessage(res, postData, mailer)
            return
        }
        
        // Resident Registration
        if (urlPath === '/post/fregister' && postData.email) {
            await handleResidentRegistration(res, postData, ipAddress, userAgent, mailer)
            return
        }

        // invalid POST
        updateResWith400(res, postData)
    })
}

async function checkRequest(responseKey) {
    if (!responseKey) {
        logging.info(`    L checkRequest failed (responseKey: ${responseKey})`)
        return false
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaConfig.secretKey}&response=${responseKey}`
    const response = await axios.post(verificationUrl)
    logging.info(`    L finished checkRequest. response.data: ${JSON.stringify(response.data)}`)
    return response.data.success
}

async function handleLike(res, postData, ipAddress, userAgent) {
    logging.info(`    L like (lan: ${postData.lan}, urlPath: ${postData.urlPath})`)
    const likeObj = {
        urlPath: postData.urlPath,
        lan: postData.lan,
        date: new Date(),
        ipAddress,
        userAgent
    }
    await mongodbDriver.insertOne('likes', likeObj)
    res.writeHead(302, { Location: `${_getUrlPrefix(postData.lan)}${postData.urlPath}` })
    res.end()
}

async function handleComment(res, postData, ipAddress, userAgent, url, mailer) {
    logging.info(`    L comment (lan: ${postData.lan}, urlPath: ${postData.urlPath}, name: ${postData.name}, comment: ${postData.comment})`)
    mailer.send({
        subject: `get comment from '${postData.name}' (lan: ${postData.lan})`,
        text: `urlPath: ${postData.urlPath}\nURL: ${url + _getUrlPrefix(postData.lan) + postData.urlPath}`
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
    res.writeHead(302, { Location: `${_getUrlPrefix(postData.lan)}${postData.urlPath}#comments-form` })
    res.end()
}

async function handleMessage(res, postData, mailer) {
    const message = postData.message
    const isSpam = _isSpamMessage(message)
    logging.info(`    L get message (lan: ${postData.lan}, message: ${message}, isSpam: ${isSpam})`)

    if (!isSpam) {
        mailer.send({
            subject: `get message (lan: ${postData.lan})`,
            text: `${message}`
        })
        logging.info('    L email sent')
        res.writeHead(302, { Location: `${_getUrlPrefix(postData.lan)}/?messageSent=true` })
        res.end()
        logging.info('    L 302 response')
    } else {
        // mailer.send({
        //     subject: `get SPAM message (lan: ${postData.lan})`,
        //     text: `${message}`
        // })
        updateResWith400(res, postData)
        logging.info('    L 400 response')
    }
}

async function handleResidentRegistration(res, postData, ipAddress, userAgent, mailer) {
    const residentObj = await mongodbDriver.findOne('registrations', { email: postData.email })
    const residentStatus = ((residentObj)) ? residentObj.residentStatus : 'NONE'
    logging.info(`    L resident registration (email: ${postData.email}, residentStatus: ${residentStatus})`)
    
    let registrationObj
    let insertResult
    switch (residentStatus) {
    case 'NONE':
        registrationObj = {
            email: postData.email,
            residentStatus: 'PRE_REGISTERED',
            preRegisteredDate: new Date(),
            ipAddress,
            userAgent
        }
        insertResult = await mongodbDriver.insertOne('registrations', registrationObj)

        mailer.send({
            from: '"Fully Hatter" <no-reply@furimako.com>',
            to: postData.email,
            subject: '住人登録を完了してください',
            headers: {
                'X-Mailjet-Campaign': 'Resident Registration',
                // 'X-Mailjet-DeduplicateCampaign': true,
                'X-MJ-TemplateLanguage': 1,
                'X-MJ-TemplateID': 1646405,
                'X-MJ-Vars': '{ "confirmation_link": '
                            + `"https://${(process.env.NODE_ENV === 'production') ? 'furimako.com' : 'localhost:8129'}`
                            + `/?residentId=${insertResult.insertedId}" }`,
                'X-MJ-TemplateErrorReporting': 'furimako@gmail.com'
            }
        })
        res.writeHead(302, { Location: `/?registration=MAIL_SENT&email=${qs.escape(postData.email)}` })
        res.end()
        break
        
    case 'PRE_REGISTERED':
        res.writeHead(302, { Location: `/?registration=ALREADY_PRE_REGISTERED&email=${qs.escape(postData.email)}` })
        res.end()
        break

    case 'REGISTERED':
        res.writeHead(302, { Location: `/?registration=ALREADY_REGISTERED&email=${qs.escape(postData.email)}` })
        res.end()
        break

    default:
        throw new Error(`should not be here (residentStatus: ${residentStatus})`)
    }
}

function updateResWith400(res, postData) {
    logging.info(`    L get invalid POST (postData: ${JSON.stringify(postData)})`)
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end('400 Bad Request')
}

function _getUrlPrefix(lan) {
    return (lan === 'en') ? '/en' : ''
}

function _isSpamMessage(message) {
    const messageStr = message.toLowerCase()
    for (const spamText of spamTextList) {
        if (messageStr.includes(spamText.toLowerCase())) {
            return true
        }
    }

    return false
}
