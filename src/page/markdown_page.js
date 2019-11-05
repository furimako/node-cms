const fs = require('fs')
const marked = require('marked')
const mustache = require('mustache')

marked.setOptions({ breaks: true })
const BasePage = require('./base_page')
const rooting = require('../../static/rooting')
const tags = require('../../static/tags')

const relatedPagesTemplate = fs.readFileSync('./static/template/related-pages.mustache', 'utf8')

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
        const _tags = _getTags(urlPath)
        if (chapter) {
            this.urlPathBase = `${element.urlPath}`
            title += ` ${parseInt(chapter, 10)}`
        }
        if (titleWithDescription) {
            /* eslint no-irregular-whitespace: "off" */
            title += `　−　${element.description}`
        }
        
        this.setView({
            urlPath,
            title,
            description: element.description,
            cssPath: '/css/styles-others.css',
            isNew: element.isNew,
            bodyHTML,
            tags: _tags,
            relatedPages: _getRelatedPages(_tags.map((tagObj) => tagObj.tagName), urlPath),
            relatedPages2: _getRelatedPages(_tags.map((tagObj) => tagObj.tagName), urlPath, true),
            numOfChapters: element.numOfChapters,
            chapter
        })
    }
}

function _getTags(urlPath) {
    const _tags = []
    Object.keys(tags).forEach((key) => {
        tags[key].targets.forEach((target) => {
            if (target === urlPath) {
                _tags.push({ tagName: key, tagNameEn: tags[key].tagNameEn })
            }
        })
    })
    return _tags
}

function _getRelatedPages(correspondingTags, thisUrlPath, second = false) {
    const view = { tags: [] }
    Object.keys(tags).forEach((key) => {
        if (!correspondingTags.includes(key)) {
            return
        }
        
        const tag = {
            tagName: key,
            tagNameEn: tags[key].tagNameEn + ((second) ? '2' : ''),
            targets: []
        }
        
        const targetUrlPaths = tags[key].targets.filter((urlPath) => urlPath !== thisUrlPath)
        for (let i = 0; i < targetUrlPaths.length; i += 1) {
            const urlPath = targetUrlPaths[i]
            const descriptions = _getDescriptions(urlPath)
            let headHTML
            let footHTML
            if (i === 0) {
                headHTML = '<div class="column">'
            }
            if (i === Math.floor((targetUrlPaths.length - 1) / 2)) {
                footHTML = '</div>'
                footHTML += '<div class="column">'
            }
            if (i === targetUrlPaths.length - 1) {
                footHTML = '</div>'
            }
            
            tag.targets.push({
                urlPath,
                title: descriptions.title,
                description: descriptions.description,
                headHTML,
                footHTML
            })
        }
        
        view.tags.push(tag)
    })
    
    return mustache.render(relatedPagesTemplate, view)
}

function _getDescriptions(urlPath) {
    const descriptions = {}
    
    rooting.forEach((v) => {
        if (v.class !== 'MarkdownPage') {
            return
        }
        
        v.elements.forEach((e) => {
            if (e.urlPath === urlPath) {
                descriptions.title = e.title
                descriptions.description = e.description
            }
        })
    })
    return descriptions
}
