const fs = require('fs')
const BasePage = require('./base_page')

module.exports = class ImagePage extends BasePage {
    constructor({ element, filePath }) {
        let contentType
        if (filePath.match(/\.png$/)) {
            contentType = 'image/png'
        } else if (filePath.match(/\.jpg$/)) {
            contentType = 'image/jpeg'
        }
        
        const content = fs.readFileSync(filePath)
        super({ urlPath: element.urlPath, contentType, content })
    }
}
