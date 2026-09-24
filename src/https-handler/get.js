const { parse } = require('url')
const { ObjectId } = require('mongodb')
const logging = require('../utils/logging')
const acmeChallenge = require('../acme_challenge')
const mongodbDriver = require('../mongodb_driver')
const Pages = require('../pages')
const mailjetConfig = require('../../configs/configs').mailjet

const mailjetAuth = Buffer.from(`${mailjetConfig.MJ_APIKEY_PUBLIC}:${mailjetConfig.MJ_APIKEY_PRIVATE}`).toString('base64')
const pages = new Pages()

module.exports = async function get(req, res, options) {
    const { mailer } = options

    const urlPath = parse(req.url).pathname
    const { query } = parse(req.url, true)
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    logging.info(`    L url: ${urlPath}, IP Address: ${ipAddress}`)

    let lan
    if (urlPath.startsWith('/en/')) {
        // English page
        lan = 'en'
    } else {
        // Japanese page
        lan = 'ja'
    }
    
    if (!pages.has(urlPath)) {
        // for certbot
        if (acmeChallenge.isAcmeChallenge(urlPath) && acmeChallenge.respond(res, urlPath)) {
            return
        }

        // When pages no found
        logging.info('    L responsing no-found page')
        const html = await pages.get('/no-found')
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end(html)
        return
    }

    logging.info(`    L responsing GET page (urlPath: ${urlPath}, lan: ${lan})`)
    if (JSON.stringify(query) !== '{}') {
        logging.info(`        L query: ${JSON.stringify(query)}`)
    }
    
    if (query.residentId) {
        // when click registration button
        const residentObj = await mongodbDriver.findOne(
            'registrations',
            { _id: new ObjectId(query.residentId), residentStatus: 'PRE_REGISTERED' }
        )
        if (residentObj) {
            logging.info(`    L registered (residentId: ${query.residentId}, residentObj: ${JSON.stringify(residentObj)})`)
            await registerNewResident(mailer, query.residentId, residentObj.email)
            
            const html = await pages.get(urlPath, {
                pageNum: parseInt(query.page, 10) || 1,
                registration: { REGISTERED: true },
                email: residentObj.email
            })
            res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
            res.end(html)
            return
        }
    }
    
    // return page
    const html = await pages.get(urlPath, getPageOptions(query))
    res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
    res.end(html)
}

function getPageOptions(query) {
    let registration
    let email
    let messageSent
    if (query.test) {
        registration = {
            MAIL_SENT: true,
            ALREADY_PRE_REGISTERED: true,
            ALREADY_REGISTERED: true,
            REGISTERED: true
        }
        email = 'sample@domain.com'
        messageSent = true
    } else {
        registration = { [query.registration]: true }
        email = query.email
        messageSent = query.messageSent
    }
    
    return {
        pageNum: parseInt(query.page, 10) || 1,
        registration,
        email,
        messageSent
    }
}

async function registerNewResident(mailer, residentId, email) {
    await mongodbDriver.updateOne(
        'registrations',
        { _id: new ObjectId(residentId) },
        { residentStatus: 'REGISTERED', registeredDate: new Date() }
    )
    
    mailer.send({
        from: '"Fully Hatter" <no-reply@furimako.com>',
        to: email,
        subject: '住人登録が完了しました',
        headers: {
            'X-Mailjet-Campaign': 'Resident Registered',
            // 'X-Mailjet-DeduplicateCampaign': true,
            'X-MJ-TemplateLanguage': 1,
            'X-MJ-TemplateID': 1658779,
            'X-MJ-TemplateErrorReporting': 'furimako@gmail.com'
        }
    })
    _addContactToList(email, mailer)
}

function _addContactToList(email, mailer) {
    const addToListRequest = fetch('https://api.mailjet.com/v3/REST/listrecipient', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${mailjetAuth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ContactAlt: email, ListID: '10246915' })
    })
    addToListRequest
        .then(async (response) => {
            // the body of an error response can be empty (e.g. 401)
            const body = await response.json().catch(() => ({}))
            if (!response.ok) {
                const err = new Error(body.ErrorMessage)
                err.statusCode = response.status
                err.ErrorMessage = body.ErrorMessage
                throw err
            }
            logging.info(`contact added to list (addToListResult: ${JSON.stringify(body.Data)}`)
        })
        .catch((err) => {
            // network errors have no statusCode or ErrorMessage
            err.ErrorMessage = err.ErrorMessage || err.message
            logging.error(`addToListRequest error (err.statusCode: ${err.statusCode})`)
            logging.error(`addToListRequest error (err.ErrorMessage: ${err.ErrorMessage})`)
            mailer.send({
                subject: 'ERROR',
                text: `addToListRequest error (err.statusCode: ${err.statusCode})\n${err.ErrorMessage}`
            })
        })
}
