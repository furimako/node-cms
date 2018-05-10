
const fs = require('fs')
const mustache = require('mustache')
const marked = require('marked')
const dateString = require('./date_string')
const mongodbDriver = require('./mongodb_driver')
marked.setOptions({ breaks: true })
const URL = 'http://furimako.com'
const likeJA = 'いいね！'
const commentJA = 'コメント'
const TEMPLATE = fs.readFileSync('./static/template/template.mustache', 'utf8')
const TEMPLATE_HOME = fs.readFileSync('./static/template/home.mustache', 'utf8')
const TEMPLATE_COMMENT = fs.readFileSync('./static/template/comment.mustache', 'utf8')
const TEMPLATE_COMMENTSFIELD = fs.readFileSync('./static/template/comments-field.mustache', 'utf8')


module.exports = class Page {
    constructor() {
        this.template = TEMPLATE
    }
    
    setContentType(contentType) {
        this.contentType = contentType
    }
    
    setContent(content) {
        this.content = content
    }
    
    setViewHome(viewHome) {
        this.viewHome = viewHome
    }
    
    set(hasCommentsField, hasLikeButton) {
        this.hasCommentsField = hasCommentsField
        this.hasLikeButton = hasLikeButton
    }
    
    render(urlPath, title, description, isNew = false, numOfChapters = false, chapter = 1) {
        this.urlPath = urlPath
        this.title = title
        const cssPath = (urlPath === '/') ? '/css/styles-home.css' : '/css/styles-others.css'
        const newTag = (isNew) ? '<span class="tag is-danger">New!</span><br><br>' : ''
        
        if (numOfChapters) {
            this.urlPathBase = urlPath + '-1'
            const MARKDOWN = fs.readFileSync('./static/contents' + urlPath + '-' + chapter + '.md', 'utf8')
            let bodyHTML = '<section class="section">'
            bodyHTML += '<div class="container">'
            bodyHTML += '<div class="content is-small">'
            bodyHTML += marked(MARKDOWN)
            bodyHTML += '</div>'
            bodyHTML += '</div>'
            bodyHTML += '</section>'
            
            this.template = mustache.render(this.template, {
                url: URL + urlPath + '-' + parseInt(chapter, 10),
                title: title + ' ' + parseInt(chapter, 10),
                description,
                cssPath,
                newTag,
                paginationHTML: getPaginationHTML(urlPath, numOfChapters, chapter),
                bodyHTML,
                commentsFieldHTML: '{{{commentsFieldHTML}}}',
                likeButton: '{{{likeButton}}}'
            })
            return
        }
        
        this.template = mustache.render(this.template, {
            url: URL + urlPath,
            title,
            description,
            cssPath,
            newTag,
            bodyHTML: '{{{bodyHTML}}}',
            commentsFieldHTML: '{{{commentsFieldHTML}}}',
            likeButton: '{{{likeButton}}}'
        })
    }
    
    renderBody(filePath) {
        const bodyHTML = fs.readFileSync(filePath, 'utf8')
        this.content = mustache.render(this.template, { bodyHTML })
    }
    
    renderMarkdown(urlPath) {
        const MARKDOWN = fs.readFileSync('./static/contents' + urlPath + '.md', 'utf8')
        let bodyHTML = '<section class="section">'
        bodyHTML += '<div class="container">'
        bodyHTML += '<div class="content is-small">'
        bodyHTML += marked(MARKDOWN)
        bodyHTML += '</div>'
        bodyHTML += '</div>'
        bodyHTML += '</section>'
        this.template = mustache.render(this.template, {
            bodyHTML,
            commentsFieldHTML: '{{{commentsFieldHTML}}}',
            likeButton: '{{{likeButton}}}'
        })
    }
    
    get(callback) {
        if (this.content) {
            callback(this.content)
            return
        }
        
        if (this.urlPath === '/') {
            mongodbDriver.findSummary((summary) => {
                for (let i = 0; i < this.viewHome.world.length; i++) {
                    let likeCount = summary.likeCount[this.viewHome.world[i].urlPath] || 0
                    let commentCount = summary.commentCount[this.viewHome.world[i].urlPath] || 0
                    this.viewHome.world[i].like = likeJA + ' ' + likeCount
                    this.viewHome.world[i].comment = commentJA + ' ' + commentCount
                    
                    if (i === 0) {
                        this.viewHome.world[i].headHTML = '<div class="column">'
                    }
                    if (i === Math.floor((this.viewHome.world.length - 1) / 2)) {
                        this.viewHome.world[i].footHTML = '</div>'
                        this.viewHome.world[i].footHTML += '<div class="column">'
                    }
                    if (i === this.viewHome.world.length - 1) {
                        this.viewHome.world[i].footHTML = '</div>'
                    }
                }
                
                for (let i = 0; i < this.viewHome.story.length; i++) {
                    let likeCount = summary.likeCount[this.viewHome.story[i].urlPath] || 0
                    this.viewHome.story[i].like = likeJA + ' ' + likeCount
                    
                    if (i === 0) {
                        this.viewHome.story[i].headHTML = '<div class="column">'
                    }
                    if (i === Math.floor((this.viewHome.story.length - 1) / 2)) {
                        this.viewHome.story[i].footHTML = '</div>'
                        this.viewHome.story[i].footHTML += '<div class="column">'
                    }
                    if (i === this.viewHome.story.length - 1) {
                        this.viewHome.story[i].footHTML = '</div>'
                    }
                }
                
                const bodyHTML = mustache.render(TEMPLATE_HOME, this.viewHome)
                callback(mustache.render(this.template, { bodyHTML }))
            })
            return
        }

        mongodbDriver.findPageLikes(this.urlPathBase || this.urlPath, (pageLike) => {
            let likeButton = ''
            if (this.hasLikeButton) {
                likeButton = `<form method="post" action="${this.urlPathBase || this.urlPath}">`
                likeButton += `<button class="button is-small is-primary is-outlined is-rounded" name="id" value=0>${likeJA} ${pageLike || 0}</button>`
                likeButton += '</form>'
            }

            if (this.hasCommentsField) {
                let id = 0
                let commentsHTML = ''
                mongodbDriver.findComments(this.urlPath, (comments) => {
                    mongodbDriver.findLikes(this.urlPath, (likes) => {
                        for (let commentObj of comments) {
                            id++
                            commentObj.urlPath = this.urlPath
                            commentObj.id = id
                            commentObj.timestamp = dateString.str(commentObj.date)
                            commentObj.comment = mustache.render('{{raw}}', { 'raw': commentObj.comment })
                            commentObj.comment = commentObj.comment.replace(/\n/g, '<br>')
                            let likeCount = likes[id] || 0
                            commentObj.like = likeJA + ' ' + likeCount
                            commentsHTML += mustache.render(TEMPLATE_COMMENT, commentObj)
                        }
                        
                        const commentsFieldHTML = mustache.render(
                            TEMPLATE_COMMENTSFIELD, {
                                urlPath: this.urlPath,
                                commentsHTML
                            }
                        )
                        callback(mustache.render(this.template, {
                            commentsFieldHTML,
                            likeButton
                        }))
                    })
                })
            } else {
                callback(mustache.render(this.template, { likeButton }))
            }
        })
    }
}


let getPaginationHTML = (urlPath, numOfChapters, chapter) => {
    if (!chapter) {
        return ''
    }
    
    let paginationHTML = '<section class="section">'
    paginationHTML += '<nav class="pagination" role="navigation" aria-label="pagination">'
    paginationHTML += '<ul class="pagination-list">'

    for (let i = 1; i <= numOfChapters; i++) {
        if (i === chapter) {
            paginationHTML += '<li>'
            paginationHTML += `<a class="pagination-link is-current" href="${urlPath + '-' + parseInt(i, 10)}">${parseInt(i, 10)}</a>`
            paginationHTML += '</li>'
        } else {
            paginationHTML += '<li>'
            paginationHTML += `<a class="pagination-link" href="${urlPath + '-' + parseInt(i, 10)}">${parseInt(i, 10)}</a>`
            paginationHTML += '</li>'
        }
    }
    paginationHTML += '</ul>'
    paginationHTML += '</nav>'
    paginationHTML += '</section>'
    return paginationHTML
}
