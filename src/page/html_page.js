const fs = require('fs')
const BasePage = require('./base_page')

module.exports = class HTMLPage extends BasePage {
    constructor({
        lan, isMultilingual, element, filePath, hasLikeButton, hasCommentsField
    }) {
        const bodyHTML = fs.readFileSync(filePath, 'utf8')
        super({
            lan,
            element,
            urlPath: element.urlPath,
            contentType: 'text/html',
            hasLikeButton,
            hasCommentsField
        })
        this.setView({
            cssPath: '/css/styles-others.css',
            isMultilingual,
            bodyHTML
        })
    }
}
