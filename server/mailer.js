const fs = require('fs')

const mailgunConfig = JSON.parse(fs.readFileSync('./configs/mailgun-config.json', 'utf8'))
const mailgun = require('mailgun-js')(mailgunConfig)


module.exports = {
    send: (subject, text) => {
        const data = {
            from: '"Fully Hatter" <admin@furimako.com>',
            to: 'furimako@gmail.com',
            subject,
            text
        }

        mailgun.messages().send(data, (error, body) => {
            if (error) {
                Error('some error occurred in mailer')
            }
            
            console.log('--- sending mail ---')
            console.log(`body: ${body}`)
        })
    }
}
