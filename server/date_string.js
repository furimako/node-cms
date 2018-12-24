/* use this module like below */
// const dateString = require('./date_string')
// dateString(new Date())

module.exports = (dateObj) => {
    const dateJSTObj = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000)

    const year = dateJSTObj.getUTCFullYear()
    const month = dateJSTObj.getUTCMonth() + 1
    const date = dateJSTObj.getUTCDate()

    const hours = (`00${dateJSTObj.getUTCHours()}`).slice(-2)
    const minutes = (`00${dateJSTObj.getUTCMinutes()}`).slice(-2)
    const seconds = (`00${dateJSTObj.getUTCSeconds()}`).slice(-2)

    return `${year}/${month}/${date} ${hours}:${minutes}:${seconds}  JST(UTC+09:00)`
}
