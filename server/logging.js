const mailer = require('./mailer')

module.exports = {
    info: msg => console.log(`[INFO] ${msg}`),
    error: (msg) => {
        console.error(`[ERROR] ${msg}`)
        mailer.send('get ERROR', `${msg}`)
    }
}
