const dateString = require('./date_string')
const mailer = require('./mailer')
const title = 'Fully Hatter の秘密の部屋'

module.exports = {
    info: (msg) => console.log(`[${dateString(new Date())}] [INFO] ${msg}`),
    error: (msg, mail = true) => {
        console.error(`[${dateString(new Date())}] [ERROR] ${msg}`)
        if (mail) {
            mailer.send(
                `[${title}] get ERROR`,
                `${msg}`
            )
        }
    }
}
