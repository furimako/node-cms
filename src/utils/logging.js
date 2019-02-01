/* [logging.js] is used by multiple services */
const dateString = require('./date_string')
const mailer = require('./mailer')

module.exports = {
    info: msg => console.log(`${dateString.ISO8610(new Date())} [INFO] ${msg}`),
    error: (msg) => {
        console.error(`${dateString.ISO8610(new Date())} [ERROR] ${msg}`)
        mailer.send('get ERROR', `${msg}`)
    }
}
