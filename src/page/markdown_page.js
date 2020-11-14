const fs = require('fs')
const marked = require('marked')

marked.setOptions({ breaks: true })
const BasePage = require('./base_page')

module.exports = class MarkdownPage extends BasePage {
    constructor({
        lan,
        isMultilingual,
        element,
        filePath,
        titleWithDescription,
        hasLikeButton,
        hasCommentsField,
        hasRelatedPages,
        chapter,
        needToBeShared
    }) {
        const markdown = fs.readFileSync(filePath, 'utf8')
        let bodyHTML = '<section class="section">'
        bodyHTML += '<div class="container">'
        bodyHTML += '<div class="content is-small">'
        bodyHTML += marked(markdown)
        bodyHTML += '</div>'
        bodyHTML += '</div>'
        bodyHTML += '</section>'
        
        super({
            lan,
            element,
            urlPath: (chapter) ? `${element.urlPath}-${parseInt(chapter, 10)}` : element.urlPath,
            contentType: 'text/html',
            hasLikeButton,
            hasCommentsField
        })
        
        this.needToBeShared = needToBeShared
        
        this.setView({
            cssPath: '/css/styles-others.css',
            isMultilingual,
            bodyHTML,
            titleWithDescription,
            hasRelatedPages,
            chapter
        })
    }
}
