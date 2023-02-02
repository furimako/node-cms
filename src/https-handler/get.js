const fs = require('fs')
const { parse } = require('url')
const { ObjectId } = require('mongodb')
const { logging } = require('node-utils')
const nmailjet = require('node-mailjet')
const mongodbDriver = require('../mongodb_driver')
const Pages = require('../pages')
const mailjetConfig = require('../../configs/configs').mailjet

const acmeChallengeBasePath = '/.well-known/acme-challenge/'
const fileNamesForAcmeChallenge = fs.readdirSync(`./static${acmeChallengeBasePath}`)
logging.info(`finished setup fileNamesForAcmeChallenge: ${JSON.stringify(fileNamesForAcmeChallenge)}`)

/*
    fileContents = {
        fileName1: 'FILE CONTENT1',
        fileName2: 'FILE CONTENT2',
          :
    }
 */
const fileContents = {}
for (const fileName of fileNamesForAcmeChallenge) {
    const fileContent = fs.readFileSync(`./static${acmeChallengeBasePath}${fileName}`)
    fileContents[fileName] = fileContent
}

const mailjet = nmailjet.connect(mailjetConfig.MJ_APIKEY_PUBLIC, mailjetConfig.MJ_APIKEY_PRIVATE)
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
        if (isAcmeChallenge(urlPath)) {
            const fileName = _getAcmeChallengeFileName(urlPath)
            res.end(fileContents[fileName])
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
            { _id: ObjectId(query.residentId), residentStatus: 'PRE_REGISTERED' }
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

function isAcmeChallenge(urlPath) {
    if (!urlPath.startsWith(acmeChallengeBasePath)) {
        logging.info(`    L is NOT acme-challenge (urlPath: ${urlPath})`)
        return false
    }

    const selectedFileName = _getAcmeChallengeFileName(urlPath)
    const result = fileNamesForAcmeChallenge.includes(selectedFileName)
    logging.info(`    L isAcmeChallenge (urlPath: ${urlPath}, selectedFileName: ${selectedFileName}, result: ${result})`)
    return result
}

function _getAcmeChallengeFileName(urlPath) {
    return urlPath.replace(`${acmeChallengeBasePath}`, '')
}

async function registerNewResident(mailer, residentId, email) {
    await mongodbDriver.updateOne(
        'registrations',
        { _id: ObjectId(residentId) },
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
