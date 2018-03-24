const fs = require('fs')
const nodemailer = require('nodemailer')
const logging = require('./logging')
const pass = fs.readFileSync('./conf/password.txt', 'utf8')

module.exports = {
    send: (subject, text) => {
        nodemailer.createTestAccount((err, account) => {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: 'furimako@gmail.com',
                    pass
                }
            })

            let mailOptions = {
                from: '"Fully Hatter" <furimako@gmail.com>',
                to: 'furimako@gmail.com',
                subject,
                text
            }

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return console.log(err)
                }
                logging.info(`    L sent mail (${info.messageId})`)
            })
        })
    }
}
