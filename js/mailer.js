const fs = require('fs')
let mailgun = require('mailgun-js')
let api_key = fs.readFileSync('./config/password.txt', 'utf8')
api_key = api_key.replace(/\r?\n/g, '')
let DOMAIN = 'mg.furimako.com'
mailgun = require('mailgun-js')({ apiKey: api_key, domain: DOMAIN })


module.exports = {
    send: (subject, text) => {
        let data = {
            from: '"Fully Hatter" <admin@furimako.com>',
            to: 'furimako@gmail.com',
            subject,
            text
        }

        mailgun.messages().send(data, (error, body) => {
            console.log(`[body]\n${body}`)
            console.log(`[error]\n${error}`)
        })
    }
}
