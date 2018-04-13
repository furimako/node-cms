const fs = require('fs')
const nodemailer = require('nodemailer')
const logging = require('./logging')
const pass = fs.readFileSync('./config/password.txt', 'utf8')

module.exports = {
    send: (subject, text) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'furimako@gmail.com',
                pass
            }
        })

        const mailOptions = {
            from: '"Fully Hatter" <furimako@gmail.com>',
            to: 'furimako@gmail.com',
            subject,
            text
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                logging.error(`failed to send mail\n${err}`, false)
                return
            }
            logging.info(`    L sent mail (${info.messageId})`)
        })
    }
}
