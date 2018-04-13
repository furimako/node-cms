const dateString = require('./date_string')
const mailer = require('./mailer')


module.exports = {
    info: (msg) => console.log(`[${dateString.str(new Date())}] [INFO] ${msg}`),
    error: (msg) => {
        console.error(`[${dateString.str(new Date())}] [ERROR] ${msg}`)
        mailer.send(
            '[Fully Hatter の秘密の部屋] get ERROR',
            `${msg}`
        )
    }
}
