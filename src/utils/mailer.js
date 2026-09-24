const nodemailer = require('nodemailer')

module.exports = class Mailer {
    constructor({ host, user, pass }, { title, defaultFrom, defaultTo }) {
        this.title = title
        this.defaultFrom = defaultFrom
        this.defaultTo = defaultTo

        this.transporter = nodemailer.createTransport({
            host,
            port: 465,
            secure: true,
            auth: {
                user,
                pass
            }
        })
        this.transporter.verify((err) => {
            if (err) {
                console.log(err)
            } else {
                console.log('Server is ready to take our messages')
            }
        })
    }

    send({
        from = this.defaultFrom, to = this.defaultTo, subject, text, headers
    }) {
        const message = {
            from,
            to,
            subject: `【${this.title}】${subject}${(process.env.NODE_ENV === 'production') ? '' : ' (dev)'}`,
            text,
            headers
        }
        console.log('sending the message with mailer.js')
        console.log('--- message start ---')
        console.log(`${JSON.stringify(message)}`)
        console.log('--- message end ---')

        return this.transporter.sendMail(message)
    }
}
