/*
    Checks the certificate which furimako.com actually serves, and reports by email.

    Let's Encrypt stopped sending expiration notices in June 2025, and certbot has
    no hook for a failed renewal, so looking at the served certificate is the only
    way to notice every failure (renewal error, stopped timer, failed deploy hook,
    missing restart).

        node check-cert.js            daily cron (mails when it expires soon, or on monday)
        node check-cert.js --renewed  called by certbot-deploy-hook.sh (always mails)
        node check-cert.js --test     checks that the email gets delivered (always mails)
 */
const tls = require('tls')
const nodeUtils = require('node-utils')
const smtpConfig = require('../../configs/configs').smtp

const { logging } = nodeUtils
const mailer = nodeUtils.createMailer(
    smtpConfig,
    {
        title: 'Fully Hatter の秘密の部屋',
        defaultFrom: '"Fully Hatter" <fully-hatter@furimako.com>',
        defaultTo: 'furimako@gmail.com'
    }
)

const host = 'furimako.com'
const port = 443
const thresholdDays = 20
const timeoutMsec = 10000
const maxAttempts = 3
const retryIntervalMsec = 5000
// weekly report on monday, so that a broken notification path shows up as a missing email
const reportDay = 1

const mode = process.argv[2]

;(async () => {
    let expiry
    let err
    try {
        expiry = await getServedCertExpiry()
    } catch (e) {
        err = e
    }

    if (err) {
        logging.error(`failed to get the certificate of ${host}\n${err.stack}`)
        await send(
            'ERROR: failed to check the certificate',
            `could not get the certificate which ${host}:${port} serves\n\n${err.stack}`
        )
        return
    }

    const restDays = Math.floor((expiry.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    logging.info(`certificate of ${host} expires on ${expiry.toISOString()} (rest: ${restDays} days, mode: ${mode})`)

    if (mode === '--renewed') {
        await send(
            'renewed the certificate',
            `${host} serves the renewed certificate\n\n`
                + `expiry: ${expiry.toISOString()}\n`
                + `rest: ${restDays} days`
        )
        return
    }

    if (mode === '--test') {
        await send(
            'test of the certificate check',
            `this email is sent by 'check-cert.js --test'\n\n`
                + `expiry: ${expiry.toISOString()}\n`
                + `rest: ${restDays} days`
        )
        return
    }

    if (restDays < thresholdDays) {
        await send(
            `ERROR: the certificate expires in ${restDays} days`,
            `${host} still serves the certificate which expires on ${expiry.toISOString()}\n\n`
                + 'certbot renews it 30 days before the expiry, so the renewal is NOT working.\n'
                + 'see README.md (How to renew certbot) to find out what has broken.'
        )
        return
    }

    if (new Date().getDay() === reportDay) {
        await send(
            'the certificate is up to date',
            `${host} serves the certificate which expires on ${expiry.toISOString()}\n\n`
                + `rest: ${restDays} days`
        )
        return
    }

    logging.info('    L sent no email (the certificate is up to date)')
    // nodemailer keeps the connection, so the process does not exit by itself
    process.exit(0)
})()

async function getServedCertExpiry() {
    let lastErr
    for (let i = 1; i <= maxAttempts; i += 1) {
        try {
            return await _connectAndGetExpiry()
        } catch (err) {
            lastErr = err
            logging.info(`    L failed to connect (attempt: ${i}/${maxAttempts}, err: ${err.message})`)
            if (i < maxAttempts) {
                await _wait(retryIntervalMsec)
            }
        }
    }
    throw lastErr
}

function _connectAndGetExpiry() {
    return new Promise((resolve, reject) => {
        const socket = tls.connect({ host, port, servername: host }, () => {
            const cert = socket.getPeerCertificate()
            socket.end()
            if (!cert || !cert.valid_to) {
                reject(new Error(`got no certificate from ${host}:${port}`))
                return
            }
            const expiry = new Date(cert.valid_to)
            if (Number.isNaN(expiry.getTime())) {
                reject(new Error(`got an invalid expiry (valid_to: ${cert.valid_to})`))
                return
            }
            resolve(expiry)
        })
        socket.setTimeout(timeoutMsec, () => {
            socket.destroy()
            reject(new Error(`timed out to connect to ${host}:${port}`))
        })
        socket.on('error', (err) => {
            socket.destroy()
            reject(err)
        })
    })
}

function _wait(msec) {
    return new Promise((resolve) => { setTimeout(resolve, msec) })
}

async function send(subject, text) {
    try {
        await mailer.send({ subject, text })
        logging.info(`    L sent the email (subject: ${subject})`)
    } catch (err) {
        logging.error(`failed to send the email (subject: ${subject})\n${err.stack}`)
        // nodemailer keeps the connection, so the process does not exit by itself
        process.exit(1)
    }
    process.exit(0)
}
