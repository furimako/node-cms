const fs = require('fs')
const mustache = require('mustache')
const { JST } = require('node-utils')
const mongodbDriver = require('../mongodb_driver')

const env = process.env.NODE_ENV
const url = (env === 'production') ? 'http://furimako.com' : 'http://localhost:8128'
const likeJA = 'いいね！'
const template = fs.readFileSync('./static/template/template.mustache', 'utf8')
const commentsFieldTemplate = fs.readFileSync('./static/template/comments-field.mustache', 'utf8')
const paginationTemplate = fs.readFileSync('./static/template/pagination.mustache', 'utf8')

module.exports = class BasePage {
    constructor({
        urlPath, contentType, content, hasCommentsField, hasLikeButton
    }) {
        this.urlPath = urlPath
        this.contentType = contentType
        this.content = content
        this.hasCommentsField = hasCommentsField
        this.hasLikeButton = hasLikeButton
    }
    
    setView({
        urlPath,
        title,
        description,
        cssPath,
        isNew,
        bodyHTML,
        tags,
        relatedPages,
        relatedPages2,
        numOfChapters,
        chapter
    }) {
        let paginationHTML
        if (this.urlPathBase && numOfChapters && chapter) {
            const paginationView = { pagination: [] }
            for (let i = 1; i <= numOfChapters; i += 1) {
                paginationView.pagination.push({
                    pageNum: i,
                    urlPathBase: this.urlPathBase,
                    isCurrent: (i === chapter) ? 'is-current' : ''
                })
            }
            paginationHTML = mustache.render(paginationTemplate, paginationView)
        }
        
        this.view = {
            url: `${url + urlPath}`,
            title,
            description,
            cssPath,
            newTag: (isNew) ? '<span class="tag is-danger">New!</span><br><br>' : '',
            bodyHTML,
            tags,
            relatedPages,
            relatedPages2,
            paginationHTML
        }
    }
    
    async get() {
        if (this.content) {
            return this.content
        }
        
        if (this.hasLikeButton) {
            const urlPath = (this.urlPathBase) ? `${this.urlPathBase}-1` : this.urlPath
            const likeCount = await mongodbDriver.findLikeCount(urlPath)
            this.view.likeButton = { urlPath, likeJA, likeCount }
        }
        
        if (this.hasCommentsField) {
            return this._getWithComments()
        }
        return this._getWithNoComments()
    }
    
    _getWithNoComments() {
        this.view.navbar = true
        return mustache.render(template, this.view)
    }

    async _getWithComments() {
        const commentsArray = await mongodbDriver.findComments({ urlPath: this.urlPath })
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
                comment: mustache.render('{{raw}}', { raw: comment.comment }).replace(/\n/g, '<br>')
            })
            commentIds.push({
                urlPath: this.urlPath,
                commentId: id
            })
        })
        
        const commentsFieldHTML = mustache.render(
            commentsFieldTemplate,
            { urlPath: this.urlPath, comments }
        )
        
        this.view.commentsFieldHTML = commentsFieldHTML
        this.view.navbar = true
        this.view.navbarComment = '<a class="navbar-item" href="#comments-field">コメントする</a>'
        return mustache.render(template, this.view)
    }
}
