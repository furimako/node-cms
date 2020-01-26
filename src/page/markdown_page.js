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
        hasRelatedPages,
        chapter
    }) {
        const title = {}
        const description = {}
        if (element.ja) {
            title.ja = element.ja.title
            description.ja = element.ja.description
            if (chapter) {
                title.ja += ` ${parseInt(chapter, 10)}`
            }
            if (titleWithDescription) {
                /* eslint no-irregular-whitespace: "off" */
                title.ja += `　−　${element.ja.description}`
            }
        }
        if (element.en) {
            title.en = element.en.title
            description.en = element.en.description
            if (chapter) {
                title.en += ` ${parseInt(chapter, 10)}`
            }
            if (titleWithDescription) {
                /* eslint no-irregular-whitespace: "off" */
                title.en += `　−　${element.en.description}`
            }
        }
        
        super({
            element,
            urlPath: (chapter) ? `${element.urlPath}-${parseInt(chapter, 10)}` : element.urlPath,
            contentType: 'text/html',
            title,
            description,
            hasLikeButton,
            hasCommentsField,
            hasRelatedPages
        })
        this.urlPathBase = element.urlPath
        
        const markdown = fs.readFileSync(filePath, 'utf8')
        let bodyHTML = '<section class="section">'
        bodyHTML += '<div class="container">'
        bodyHTML += '<div class="content is-small">'
        bodyHTML += marked(markdown)
        bodyHTML += '</div>'
        bodyHTML += '</div>'
        bodyHTML += '</section>'
        
        this.setView({
            cssPath: '/css/styles-others.css',
            bodyHTML,
            chapter
        })
    }
}
