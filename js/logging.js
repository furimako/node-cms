const dateString = require('./date_string')


module.exports = {
    info: (msg) => console.log(`[${dateString.str(new Date())}] [INFO] ${msg}`),
    error: (msg) => console.error(`[${dateString.str(new Date())}] [ERROR] ${msg}`)
}
