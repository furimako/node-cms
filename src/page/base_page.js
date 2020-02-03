const fs = require('fs')
const mustache = require('mustache')
const { JST } = require('node-utils')
const rooting = require('../../static/rooting')
const tags = require('../../static/tags')
const mongodbDriver = require('../mongodb_driver')

const env = process.env.NODE_ENV
const url = (env === 'production') ? 'http://furimako.com' : 'http://localhost:8128'
const likeJA = 'いいね！'
const template = fs.readFileSync('./static/template/template.mustache', 'utf8')
const commentsFieldTemplate = fs.readFileSync('./static/template/comments-field.mustache', 'utf8')
const paginationTemplate = fs.readFileSync('./static/template/pagination.mustache', 'utf8')
const relatedPagesTemplate = fs.readFileSync('./static/template/related-pages.mustache', 'utf8')

module.exports = class BasePage {
    constructor({
        element,
        urlPath,
        contentType,
        title,
        description,
        bodyHTML,
        hasCommentsField,
        hasLikeButton,
        hasRelatedPages
    }) {
        this.element = element
        this.urlPath = urlPath
        this.contentType = contentType
        this.title = title
        this.description = description
        this.bodyHTML = bodyHTML
        this.hasCommentsField = hasCommentsField
        this.hasLikeButton = hasLikeButton
        this.hasRelatedPages = hasRelatedPages
    }
    
    setView({ cssPath, chapter }) {
        let paginationHTML
        if (this.urlPathBase && this.element.numOfChapters && chapter) {
            const paginationView = { pagination: [] }
            for (let i = 1; i <= this.element.numOfChapters; i += 1) {
                paginationView.pagination.push({
                    pageNum: i,
                    urlPathBase: this.urlPathBase,
                    isCurrent: (i === chapter) ? 'is-current' : ''
                })
            }
            paginationHTML = mustache.render(paginationTemplate, paginationView)
        }
        
        this.view = {
            url: `${url + this.urlPath}`,
            cssPath,
            isNew: this.element.isNew,
            paginationHTML
        }
    }
    
    // HTMLPage, MarkdownPage
    async get(lan) {
        this.view.lan = { [lan]: true }
        this.view.title = this.title[lan]
        this.view.description = this.description[lan]
        this.view.bodyHTML = this.bodyHTML[lan]
        
        if (this.hasRelatedPages) {
            this.view.keywordTag = _getKeywordTag(this.urlPath, lan)
            this.view.relatedPages = _getRelatedPages(
                this.view.keywordTag.tagItems.map((tagObj) => tagObj.tagId),
                this.urlPath,
                lan
            )
            this.view.relatedPages2 = _getRelatedPages(
                this.view.keywordTag.tagItems.map((tagObj) => tagObj.tagId),
                this.urlPath,
                lan,
                true
            )
        }
        
        if (this.hasLikeButton) {
            const urlPath = (this.urlPathBase) ? `${this.urlPathBase}-1` : this.urlPath
            const likeCount = await mongodbDriver.findLikeCount(urlPath)
            this.view.likeButton = { urlPath, likeJA, likeCount }
        }
        
        if (this.hasCommentsField) {
            return this._getWithComments(lan)
        }
        return this._getWithNoComments()
    }
    
    _getWithNoComments() {
        this.view.navbar = true
        return mustache.render(template, this.view)
    }

    async _getWithComments(lan) {
        const commentsArray = await mongodbDriver.findComments(
            { urlPath: this.urlPath, lan }
        )
        // from oldest to latest
        commentsArray.sort((obj1, obj2) => obj1.date.getTime() - obj2.date.getTime())
        
        let id = 0
        const comments = []
        const commentIds = []
        commentsArray.forEach((comment) => {
            id += 1
            comments.push({
                id,
                name: comment.name,
                timestamp: JST.convertToDatetime(comment.date),
                comment: mustache.render('{{raw}}', { raw: comment.comment }).replace(/(\r\n|\n|\r)/gm, '<br>')
            })
            commentIds.push({
                urlPath: this.urlPath,
                commentId: id
            })
        })
        
        const commentsFieldHTML = mustache.render(
            commentsFieldTemplate,
            {
                urlPath: this.urlPath,
                comments,
                lan: { [lan]: true }
            }
        )
        
        this.view.commentsFieldHTML = commentsFieldHTML
        this.view.navbar = true
        this.view.hasComments = true
        return mustache.render(template, this.view)
    }
}

function _getKeywordTag(urlPath, lan) {
    const keywordTag = { tagItems: [] }
    Object.keys(tags).forEach((key) => {
        tags[key].targets.forEach((target) => {
            if (target === urlPath) {
                keywordTag.tagItems.push({
                    tagName: (lan === 'ja') ? tags[key].ja : key,
                    tagId: key
                })
            }
        })
    })
    return keywordTag
}

function _getRelatedPages(correspondingTags, thisUrlPath, lan, second = false) {
    if (correspondingTags.length === 0) {
        return ''
    }
    const view = { tags: [] }
    Object.keys(tags).forEach((key) => {
        if (!correspondingTags.includes(key)) {
            return
        }
        
        const tag = {
            tagName: (lan === 'ja') ? tags[key].ja : key,
            tagId: key + ((second) ? '2' : ''),
            targets: []
        }
        
        const targetUrlPaths = tags[key].targets.filter((urlPath) => urlPath !== thisUrlPath)
        for (let i = 0; i < targetUrlPaths.length; i += 1) {
            const urlPath = targetUrlPaths[i]
            const descriptions = _getDescriptions(urlPath, lan)
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

function _getDescriptions(urlPath, lan) {
    const descriptions = {}
    
    rooting.forEach((v) => {
        if (v.class !== 'MarkdownPage') {
            return
        }
        v.elements.forEach((e) => {
            if (e.urlPath === urlPath) {
                descriptions.title = e[lan].title
                descriptions.description = e[lan].description
            }
        })
    })
    return descriptions
}
