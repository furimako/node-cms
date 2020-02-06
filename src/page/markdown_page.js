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
        const bodyHTML = {}
        if (element.ja) {
            title.ja = element.ja.title
            description.ja = element.ja.description
            if (chapter) {
                title.ja += ` ${parseInt(chapter, 10)}`
            }
            if (titleWithDescription) {
                /* eslint no-irregular-whitespace: "off" */
                title.ja += `<br>〜${element.ja.description}〜`
            }
            
            const markdown = fs.readFileSync(filePath.ja, 'utf8')
            bodyHTML.ja = '<section class="section">'
            bodyHTML.ja += '<div class="container">'
            bodyHTML.ja += '<div class="content is-small">'
            bodyHTML.ja += marked(markdown)
            bodyHTML.ja += '</div>'
            bodyHTML.ja += '</div>'
            bodyHTML.ja += '</section>'
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
            
            const markdown = fs.readFileSync(filePath.en, 'utf8')
            bodyHTML.en = '<section class="section">'
            bodyHTML.en += '<div class="container">'
            bodyHTML.en += '<div class="content is-small">'
            bodyHTML.en += marked(markdown)
            bodyHTML.en += '</div>'
            bodyHTML.en += '</div>'
            bodyHTML.en += '</section>'
        }
        
        super({
            element,
            urlPath: (chapter) ? `${element.urlPath}-${parseInt(chapter, 10)}` : element.urlPath,
            contentType: 'text/html',
            title,
            description,
            bodyHTML,
            hasLikeButton,
            hasCommentsField,
            hasRelatedPages
        })
        this.setView({
            cssPath: '/css/styles-others.css',
            chapter
        })
    }
}
