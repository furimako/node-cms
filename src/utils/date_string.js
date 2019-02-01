/* [date_string.js] is used by multiple services */
module.exports = {
    str(dateObj) {
        const {
            year, month, date, hours, minutes, seconds
        } = JST(dateObj)
        return `${year}/${month}/${date} ${hours}:${minutes}:${seconds}  JST(UTC+09:00)`
    },
    ISO8610(dateObj) {
        const {
            year, month, date, hours, minutes, seconds
        } = JST(dateObj)
        return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}+09:00`
    }
}

function JST(dateObj) {
    const dateJSTObj = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000)
    
    const year = dateJSTObj.getUTCFullYear()
    const month = (`00${dateJSTObj.getUTCMonth() + 1}`).slice(-2)
    const date = (`00${dateJSTObj.getUTCDate()}`).slice(-2)
    
    const hours = (`00${dateJSTObj.getUTCHours()}`).slice(-2)
    const minutes = (`00${dateJSTObj.getUTCMinutes()}`).slice(-2)
    const seconds = (`00${dateJSTObj.getUTCSeconds()}`).slice(-2)
    
    return {
        year, month, date, hours, minutes, seconds
    }
}
