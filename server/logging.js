module.exports = {
    info: (msg) => console.log(`[${getTimestamp(new Date())}] [INFO] ${msg}`),
    error: (msg) => console.error(`[${getTimestamp(new Date())}] [ERROR] ${msg}`)
}

let getTimestamp = (date) => {
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${('00' + date.getHours()).slice(-2)}:${('00' + date.getMinutes()).slice(-2)}:${('00' + date.getSeconds()).slice(-2)}`
}
