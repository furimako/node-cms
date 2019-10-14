const fs = require('fs')
const BasePage = require('./base_page')

module.exports = class HTMLPage extends BasePage {
    constructor({
        element, filePath, hasLikeButton, hasCommentsField
    }) {
        super({
            urlPath: element.urlPath,
            contentType: 'text/html',
            hasLikeButton,
            hasCommentsField
        })
        
        this._setView({
            urlPath: element.urlPath,
            title: element.title,
            description: element.description,
            cssPath: '/css/styles-others.css',
            isNew: element.isNew,
            bodyHTML: fs.readFileSync(filePath, 'utf8')
        })
    }
}
