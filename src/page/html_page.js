const fs = require('fs')
const BasePage = require('./base_page')

module.exports = class HTMLPage extends BasePage {
    constructor({
        element, filePath, hasLikeButton, hasCommentsField
    }) {
        const title = {}
        const description = {}
        const bodyHTML = {}
        if (element.ja) {
            title.ja = element.ja.title
            description.ja = element.ja.description
            bodyHTML.ja = fs.readFileSync(filePath.ja, 'utf8')
        }
        if (element.en) {
            title.en = element.en.title
            description.en = element.en.description
            bodyHTML.en = fs.readFileSync(filePath.en, 'utf8')
        }
        
        super({
            element,
            urlPath: element.urlPath,
            contentType: 'text/html',
            title,
            description,
            bodyHTML,
            hasLikeButton,
            hasCommentsField
        })
        this.setView({ cssPath: '/css/styles-others.css' })
    }
}
