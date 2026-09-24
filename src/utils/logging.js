const JST = require('./jst')

module.exports = {
    info: (msg) => {
        const dateNow = new Date()
        console.log(`${JST.convertToISO8610(dateNow)} [INFO] ${msg}`)
    },
    error: (msg) => {
        const dateNow = new Date()
        console.error(`${JST.convertToISO8610(dateNow)} [ERROR] ${msg}`)
    }
}
