const { parse } = require('url')
const { ObjectId } = require('mongodb')
const { logging } = require('node-utils')
const nmailjet = require('node-mailjet')
const mongodbDriver = require('../mongodb_driver')
const Pages = require('../pages')
const mailjetConfig = require('../../configs/mailjet-config')

const mailjet = nmailjet.connect(mailjetConfig.MJ_APIKEY_PUBLIC, mailjetConfig.MJ_APIKEY_PRIVATE)
const pages = new Pages()

module.exports = async function get(req, res, options) {
    const { mailer } = options

    let urlPath = parse(req.url).pathname
    const { query } = parse(req.url, true)
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    logging.info(`    L url: ${urlPath}, IP Address: ${ipAddress}`)

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
    
    if (!pages.has(urlPath, lan)) {
        // When pages no found
        logging.info('    L responsing no-found page')
        const html = await pages.get('/no-found', 'ja')
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end(html)
        return
    }

    logging.info(`    L responsing GET page (urlPath: ${urlPath}, lan: ${lan})`)
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
            
            // async
            mongodbDriver.updateOne(
                'registrations',
                { _id: ObjectId(query.residentId) },
                { residentStatus: 'REGISTERED', registeredDate: new Date() }
            )
            
            mailer.send({
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

            _addContactToList(residentObj.email, mailer)
            
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
    
    const html = await pages.get(urlPath, lan, {
        pageNum: parseInt(query.page, 10) || 1,
        signedIn,
        registration,
        email,
        messageSent
    })
    res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
    res.end(html)
}

function _addContactToList(email, mailer) {
    const addToListRequest = mailjet
        .post('listrecipient', { version: 'v3' })
        .request({ ContactAlt: email, ListID: '10246915' })
    addToListRequest
        .then((addToListResult) => {
            logging.info(`contact added to list (addToListResult: ${JSON.stringify(addToListResult.body.Data)}`)
        })
        .catch((err) => {
            logging.error(`addToListRequest error (err.statusCode: ${err.statusCode})`)
            logging.error(`addToListRequest error (err.ErrorMessage: ${err.ErrorMessage})`)
            mailer.send({
                subject: 'ERROR',
                text: `addToListRequest error (err.statusCode: ${err.statusCode})\n${err.ErrorMessage}`
            })
        })
}
