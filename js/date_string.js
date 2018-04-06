module.exports = {
    str: (date) => {
        const JST = new Date(date.getTime() + 9 * 60 * 60 * 1000)

        const YEAR = JST.getUTCFullYear()
        const MONTH = JST.getUTCMonth() + 1
        const DATE = JST.getUTCDate()

        const HOURS = ('00' + JST.getUTCHours()).slice(-2)
        const MINUTES = ('00' + JST.getUTCMinutes()).slice(-2)
        const SECONDS = ('00' + JST.getUTCSeconds()).slice(-2)

        return `${YEAR}/${MONTH}/${DATE} ${HOURS}:${MINUTES}:${SECONDS}  JST(UTC+09:00)`
    }
}
