const nodemailer = require('nodemailer')

module.exports = {
    send: (subject, text) => {
        nodemailer.createTestAccount((err, account) => {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: 'furimako@gmail.com',
                    pass: 'PLEASE INPUT THE PASSWORD HERE!'
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
                console.log(`    L sent mail (${info.messageId})`)
            })
        })
    }
}
