const fs = require('fs')
const BasePage = require('./base_page')

module.exports = class HTMLPage extends BasePage {
    constructor({
        element, filePath, hasLikeButton, hasCommentsField
    }) {
        const title = {}
        const description = {}
        if (element.ja) {
            title.ja = element.ja.title
            description.ja = element.ja.description
        }
        if (element.en) {
            title.en = element.en.title
            description.en = element.en.description
        }
        
        super({
            element,
            urlPath: element.urlPath,
            contentType: 'text/html',
            title,
            description,
            hasLikeButton,
            hasCommentsField
        })
        
        this.setView({
            cssPath: '/css/styles-others.css',
            bodyHTML: fs.readFileSync(filePath, 'utf8')
        })
    }
}
