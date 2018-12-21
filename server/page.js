
const fs = require('fs')
const mustache = require('mustache')
const marked = require('marked')
const dateString = require('./date_string')
const mongodbDriver = require('./mongodb_driver')

marked.setOptions({ breaks: true })
const likeJA = 'いいね！'
const commentJA = 'コメント'
const template = fs.readFileSync('./client/template/template.mustache', 'utf8')
const homeTemplate = fs.readFileSync('./client/template/home.mustache', 'utf8')
const navbarTemplate = fs.readFileSync('./client/template/navbar.mustache', 'utf8')
const commentTemplate = fs.readFileSync('./client/template/comment.mustache', 'utf8')
const commentsFieldTemplate = fs.readFileSync('./client/template/comments-field.mustache', 'utf8')
const likeButtonTemplate = fs.readFileSync('./client/template/like-button.mustache', 'utf8')


module.exports = class Page {
    constructor(url) {
        this.url = url
        this.template = template
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
            this.urlPathBase = `${urlPath}-1`
            
            this.template = mustache.render(this.template, {
                url: `${this.url + urlPath}-${parseInt(chapter, 10)}`,
                title: `${title} ${parseInt(chapter, 10)}`,
                description,
                cssPath,
                newTag,
                paginationHTML: getPaginationHTML(urlPath, numOfChapters, chapter),
                bodyHTML: '{{{bodyHTML}}}',
                navBarHTML: '{{{navBarHTML}}}',
                commentsFieldHTML: '{{{commentsFieldHTML}}}',
                likeButton: '{{{likeButton}}}'
            })
            return
        }
        
        this.template = mustache.render(this.template, {
            url: this.url + urlPath,
            title,
            description,
            cssPath,
            newTag,
            bodyHTML: '{{{bodyHTML}}}',
            navBarHTML: '{{{navBarHTML}}}',
            commentsFieldHTML: '{{{commentsFieldHTML}}}',
            likeButton: '{{{likeButton}}}'
        })
    }
    
    renderBodyHTML(path, chapter = false) {
        let bodyHTML = ''
        
        if (path.match(/\.html$/)) {
            bodyHTML = fs.readFileSync(path, 'utf8')
        } else {
            let filePath = `./client/contents${path}`
            filePath += (chapter) ? (`-${chapter}.md`) : '.md'
            
            const markdown = fs.readFileSync(filePath, 'utf8')
            bodyHTML = '<section class="section">'
            bodyHTML += '<div class="container">'
            bodyHTML += '<div class="content is-small">'
            bodyHTML += marked(markdown)
            bodyHTML += '</div>'
            bodyHTML += '</div>'
            bodyHTML += '</section>'
        }
        
        this.template = mustache.render(this.template, {
            bodyHTML,
            navBarHTML: '{{{navBarHTML}}}',
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
            mongodbDriver.findLikesForHome((summary) => {
                for (let i = 0; i < this.viewHome.world.length; i += 1) {
                    const likeCount = summary.likeCount[this.viewHome.world[i].urlPath] || 0
                    const commentCount = summary.commentCount[this.viewHome.world[i].urlPath] || 0
                    this.viewHome.world[i].like = `${likeJA} ${likeCount}`
                    this.viewHome.world[i].comment = `${commentJA} ${commentCount}`
                    
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
                
                for (let i = 0; i < this.viewHome.story.length; i += 1) {
                    const likeCount = summary.likeCount[this.viewHome.story[i].urlPath] || 0
                    this.viewHome.story[i].like = `${likeJA} ${likeCount}`
                    
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
                
                const bodyHTML = mustache.render(homeTemplate, this.viewHome)
                callback(mustache.render(this.template, { bodyHTML }))
            })
            return
        }

        mongodbDriver.findLike(this.urlPathBase || this.urlPath, (pageLike) => {
            let likeButton = ''
            if (this.hasLikeButton) {
                likeButton = mustache.render(likeButtonTemplate, {
                    urlPath: this.urlPathBase || this.urlPath,
                    likeJA,
                    pageLike: pageLike || 0
                })
            }

            if (this.hasCommentsField) {
                mongodbDriver.findComments(this.urlPath, (comments) => {
                    let id = 0
                    let commentsHTML = ''
                    const commentIds = []
                    comments.forEach((commentObj) => {
                        id += 1
                        const commentObjTmp = commentObj
                        commentObjTmp.id = id
                        commentObjTmp.timestamp = dateString(commentObj.date)
                        commentObjTmp.comment = mustache.render('{{raw}}', { raw: commentObj.comment })
                        commentObjTmp.comment = commentObj.comment.replace(/\n/g, '<br>')
                        commentsHTML += mustache.render(commentTemplate, commentObjTmp)
                        commentIds.push({
                            urlPath: this.urlPath,
                            commentId: id
                        })
                    })
                    
                    const commentsFieldHTML = mustache.render(
                        commentsFieldTemplate, {
                            urlPath: this.urlPath,
                            commentsHTML
                        }
                    )
                    
                    callback(mustache.render(this.template, {
                        commentsFieldHTML,
                        likeButton,
                        navBarHTML: mustache.render(navbarTemplate, {
                            commentHTML: `<a class="navbar-item" href="${this.urlPath}#comments-field">コメントする</a>`
                        })
                    }))
                })
            } else {
                callback(mustache.render(this.template, {
                    likeButton,
                    navBarHTML: mustache.render(navbarTemplate, { commentHTML: '' })
                }))
            }
        })
    }
}


let getPaginationHTML = (urlPath, numOfChapters, chapter) => {
    if (!chapter) {
        return ''
    }
    
    let paginationHTML = '<section class="section">'
    paginationHTML += '<div class="container">'
    paginationHTML += '<nav class="pagination" role="navigation" aria-label="pagination">'
    paginationHTML += '<ul class="pagination-list">'

    for (let i = 1; i <= numOfChapters; i += 1) {
        if (i === chapter) {
            paginationHTML += '<li>'
            paginationHTML += `<a class="pagination-link is-current" href="${`${urlPath}-${parseInt(i, 10)}`}">${parseInt(i, 10)}</a>`
            paginationHTML += '</li>'
        } else {
            paginationHTML += '<li>'
            paginationHTML += `<a class="pagination-link" href="${`${urlPath}-${parseInt(i, 10)}`}">${parseInt(i, 10)}</a>`
            paginationHTML += '</li>'
        }
    }
    paginationHTML += '</ul>'
    paginationHTML += '</nav>'
    paginationHTML += '</div>'
    paginationHTML += '</section>'
    return paginationHTML
}
