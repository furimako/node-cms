const fs = require('fs')
const logging = require('./utils/logging')

const basePath = '/.well-known/acme-challenge/'
const dirPath = `./static${basePath}`

// ACME token is base64url, so it never contains '/' or '.'
const tokenPattern = /^[A-Za-z0-9_-]+$/

module.exports = {
    basePath,

    isAcmeChallenge(urlPath) {
        return urlPath.startsWith(basePath)
    },

    /*
        Responds with the challenge file which certbot (--webroot) writes.
        The file is read on every request, so no restart is needed.
        Returns false when not responded (the caller should handle the request).
     */
    respond(res, urlPath) {
        const token = urlPath.slice(basePath.length)
        if (!tokenPattern.test(token)) {
            logging.info(`    L invalid acme-challenge token (urlPath: ${urlPath})`)
            return false
        }

        let content
        try {
            content = fs.readFileSync(`${dirPath}${token}`)
        } catch (err) {
            logging.info(`    L acme-challenge file no found (token: ${token})`)
            return false
        }

        logging.info(`    L responsing acme-challenge (token: ${token})`)
        res.writeHead(200, { 'Content-Type': 'application/octet-stream' })
        res.end(content)
        return true
    }
}
