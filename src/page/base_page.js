const fs = require('fs')
const mustache = require('mustache')
const { JST } = require('node-utils')
const rooting = require('../../static/rooting')
const tags = require('../../static/tags')
const mongodbDriver = require('../mongodb_driver')

const env = process.env.NODE_ENV
const url = (env === 'production') ? 'http://furimako.com' : 'http://localhost:8128'
const likeStr = { ja: 'いいね！', en: 'like' }
const template = fs.readFileSync('./static/template/template.mustache', 'utf8')
const commentsFieldTemplate = fs.readFileSync('./static/template/comments-field.mustache', 'utf8')
const paginationTemplate = fs.readFileSync('./static/template/pagination.mustache', 'utf8')
const relatedPagesTemplate = fs.readFileSync('./static/template/related-pages.mustache', 'utf8')
const residentRegistrationTemplate = fs.readFileSync('./static/template/resident-registration.mustache', 'utf8')

module.exports = class BasePage {
    constructor({
        lan,
        element,
        urlPath,
        contentType,
        hasCommentsField,
        hasLikeButton
    }) {
        this.lan = lan
        this.element = element
        this.urlPath = urlPath
        this.contentType = contentType
        this.hasCommentsField = hasCommentsField
        this.hasLikeButton = hasLikeButton
        
        // urlPathBase
        this.urlPathBase = element.urlPath
        
        // partials
        this.partial = { residentRegistrationTemplate }
    }
    
    setView({
        cssPath, isMultilingual, bodyHTML, titleWithDescription, hasRelatedPages, chapter
    }) {
        let paginationHTML
        if (this.element.numOfChapters && chapter) {
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
            lan: { [this.lan]: true },
            title: this.element[this.lan].title + ((chapter) ? ` ${parseInt(chapter, 10)}` : ''),
            description: this.element[this.lan].description,
            bodyHTML,
            isNew: this.element[this.lan].isNew,
            letter: this.element[this.lan].letter,
            url: `${url + this.urlPath}`,
            urlPath: this.urlPath,
            cssPath,
            titleWithDescription,
            paginationHTML,
            isMultilingual,
            needToBeShared: this.needToBeShared,
            registerFormMain: { registerFormId: 'registerMain' },
            registerFormFooter: { registerFormId: 'registerFooter' },
            hasTitleTags() {
                return this.isNew || this.letter
            }
        }
        if (hasRelatedPages) {
            const relatedPagesView = _getRelatedPagesView(this.urlPath, this.lan)
            const relatedPagesView2 = _getRelatedPagesView(this.urlPath, this.lan, true)
            this.view.keywordTag = relatedPagesView
            this.view.relatedPages = mustache.render(relatedPagesTemplate, relatedPagesView)
            this.view.relatedPages2 = mustache.render(relatedPagesTemplate, relatedPagesView2)
        }
    }
    
    // HTMLPage, MarkdownPage
    async get() {
        this.view.numOfResidents = await mongodbDriver.count('registrations', { residentStatus: 'REGISTERED' })
        if (this.hasLikeButton) {
            const urlPath = (this.element.numOfChapters) ? `${this.urlPathBase}-1` : this.urlPath
            const likeCount = await mongodbDriver.count('likes', { urlPath })
            this.view.likeButton = { urlPath, likeStr: likeStr[this.lan], likeCount }
        }
        
        if (this.hasCommentsField) {
            return this._getWithComments(this.lan)
        }
        return this._getWithNoComments()
    }
    
    _getWithNoComments() {
        this.view.navbar = true
        return mustache.render(template, this.view, this.partial)
    }

    async _getWithComments(lan) {
        const commentsArray = await mongodbDriver.find(
            'comments',
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
        return mustache.render(template, this.view, this.partial)
    }
}

function _getCorrespondingTags(urlPath) {
    const correspondingTags = []
    Object.keys(tags).forEach((key) => {
        tags[key].targets.forEach((target) => {
            if (urlPath === target) {
                correspondingTags.push(key)
            }
        })
    })
    return correspondingTags
}

function _getRelatedPagesView(thisUrlPath, lan, second = false) {
    const correspondingTags = _getCorrespondingTags(thisUrlPath)
    if (correspondingTags.length === 0) {
        return ''
    }

    // relatedPagesView = {
    //     tags: [{
    //         tagName: '幸せ',
    //         tagId: 'happiness',
    //         targets: [
    //             { urlPath, title, description, headHTML, footHTML },
    //             { urlPath, title, description, headHTML, footHTML }
    //         ]
    //     }]
    // }
    const relatedPagesView = {
        lan: { [lan]: true },
        tags: []
    }
    Object.keys(tags).forEach((key) => {
        if (!correspondingTags.includes(key)) {
            return
        }
        const targetUrlPaths = tags[key].targets.filter(
            (urlPath) => urlPath !== thisUrlPath && _hasPage(urlPath, lan)
        )
        if (targetUrlPaths.length === 0) {
            return
        }
        
        const tag = {
            tagName: (lan === 'ja') ? tags[key].ja : key,
            tagId: key + ((second) ? '2' : ''),
            targets: []
        }
        
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
                urlPath: ((lan === 'en') ? '/en' : '') + urlPath,
                title: descriptions.title,
                description: descriptions.description,
                headHTML,
                footHTML
            })
        }
        relatedPagesView.tags.push(tag)
    })
    
    return relatedPagesView
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

function _hasPage(urlPath, lan) {
    let pageExist = false
    rooting.forEach((v) => {
        v.elements.forEach((e) => {
            if (e.urlPath === urlPath) {
                pageExist = e[lan]
            }
        })
    })
    return pageExist
}
