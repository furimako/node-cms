const fs = require('fs')
let mailgun = require('mailgun-js')
const mailgunConfig = JSON.parse( fs.readFileSync('./config/mailgun-config.json', 'utf8') )
mailgun = require('mailgun-js')(mailgunConfig)


module.exports = {
    send: (subject, text) => {
        let data = {
            from: '"Fully Hatter" <admin@furimako.com>',
            to: 'furimako@gmail.com',
            subject,
            text
        }

        mailgun.messages().send(data, (error, body) => {
            console.log('--- sending mail ---')
            console.log(`[body]: ${body}`)
            console.log(`[error]: ${error}`)
        })
    }
}
