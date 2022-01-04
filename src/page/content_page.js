const fs = require('fs')
const BasePage = require('./base_page')

module.exports = class ContentPage extends BasePage {
    constructor({ lan, element, filePath }) {
        let contentType
        if (filePath.match(/\.png$/)) {
            contentType = 'image/png'
        } else if (filePath.match(/\.jpg$/)) {
            contentType = 'image/jpeg'
        } else if (filePath.match(/\.js$/)) {
            contentType = 'text/javascript'
        } else {
            contentType = 'text/plain'
        }
        
        super({ lan, element, contentType })
        this.content = fs.readFileSync(filePath)
    }

    async get() {
        return this.content
    }
}
