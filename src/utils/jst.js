module.exports = {
    convertToISO8610: (dateObj) => {
        if (!dateObj) {
            return ''
        }
        const {
            year, month, date, hours, minutes, seconds
        } = _convertToJSTObj(dateObj)

        return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}+09:00`
    },
    convertToDateStr: (dateObj) => {
        if (!dateObj) {
            return ''
        }
        const {
            year, month, date
        } = _convertToJSTObj(dateObj)

        return `${year}/${month}/${date}`
    },
    convertToDatetimeStr: (dateObj) => {
        if (!dateObj) {
            return ''
        }
        const {
            year, month, date, hours, minutes, seconds
        } = _convertToJSTObj(dateObj)

        return `${year}/${month}/${date} ${hours}:${minutes}:${seconds}  JST(UTC+09:00)`
    }
}

function _convertToJSTObj(dateObj) {
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
