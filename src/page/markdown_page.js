const fs = require('fs')
const marked = require('marked')

marked.setOptions({ breaks: true })
const BasePage = require('./base_page')

module.exports = class MarkdownPage extends BasePage {
    constructor({
        element,
        filePath,
        titleWithDescription,
        hasLikeButton,
        hasCommentsField,
        chapter
    }) {
        const urlPath = (chapter) ? `${element.urlPath}-${parseInt(chapter, 10)}` : element.urlPath
        
        super({
            urlPath,
            contentType: 'text/html',
            hasLikeButton,
            hasCommentsField
        })
        
        const markdown = fs.readFileSync(filePath, 'utf8')
        let bodyHTML = '<section class="section">'
        bodyHTML += '<div class="container">'
        bodyHTML += '<div class="content is-small">'
        bodyHTML += marked(markdown)
        bodyHTML += '</div>'
        bodyHTML += '</div>'
        bodyHTML += '</section>'
        
        let { title } = element
        if (chapter) {
            this.urlPathBase = `${element.urlPath}`
            title += ` ${parseInt(chapter, 10)}`
        }
        if (titleWithDescription) {
            /* eslint no-irregular-whitespace: "off" */
            title += `　−　${element.description}`
        }
        
        this._setView({
            urlPath,
            title,
            description: element.description,
            cssPath: '/css/styles-others.css',
            isNew: element.isNew,
            bodyHTML,
            numOfChapters: element.numOfChapters,
            chapter
        })
    }
}
