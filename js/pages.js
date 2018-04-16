const fs = require('fs')
const path = require('path')
const mustache = require('mustache')
const marked = require('marked')
marked.setOptions({ breaks: true })
const sass = require('node-sass')
const dateString = require('./date_string')
const mongodbDriver = require('./mongodb_driver')

const TEMPLATE = fs.readFileSync('./static/template/template.mustache', 'utf8')
const TEMPLATE_COMMENT = fs.readFileSync('./static/template/comment.mustache', 'utf8')
const TEMPLATE_COMMENTSFIELD = fs.readFileSync('./static/template/comments-field.mustache', 'utf8')
const URL = 'http://furimako.com'


module.exports = class Pages {
    constructor() {
        this.pages = new Map()
    }

    has(urlPath) {
        return this.pages.has(urlPath)
    }

    get(urlPath, callback) {
        return this.pages.get(urlPath).get(callback)
    }

    contentType(urlPath) {
        return this.pages.get(urlPath).contentType
    }

    title(urlPath) {
        return this.pages.get(urlPath).title()
    }

    add(views) {
        for (const view of views) {
            const urlPath = view.urlPath

            let elements = {}
            elements.urlPath = urlPath
            elements.hasComments = view.comments
            elements.hasLikeCount = view.like
            elements.contentType = ''
            elements.descriptions = {}
            elements.page = ''

            if (urlPath.match(/\.css$/)) {
                // CSS
                elements.contentType = 'text/css'
                const SCSS = fs.readFileSync('./static/scss/' + path.basename(urlPath, '.css') + '.scss', 'utf8')
                elements.page = sass.renderSync({ data: SCSS }).css
                this.pages.set(urlPath, new Page(elements))

            } else if (urlPath.match(/\.png$/)) {
                // PNG
                elements.contentType = 'image/png'
                elements.page = fs.readFileSync('./static' + urlPath)
                this.pages.set(urlPath, new Page(elements))

            } else if (urlPath.match(/\.jpg$/)) {
                // JPEG
                elements.contentType = 'image/jpeg'
                elements.page = fs.readFileSync('./static' + urlPath)
                this.pages.set(urlPath, new Page(elements))

            } else {
                // HTML
                elements.contentType = 'text/html'
                elements.descriptions.url = URL + urlPath
                elements.descriptions.cssPath = '/css/styles-others.css'
                elements.descriptions.description = view.description
                elements.descriptions.title = view.title

                if (view.filePath) {
                    const contentHTML = fs.readFileSync(view.filePath, 'utf8')

                    elements.descriptions.body = contentHTML
                    if (urlPath === '/') {
                        elements.descriptions.cssPath = '/css/styles-home.css'
                    }
                    this.pages.set(urlPath, new Page(elements))

                } else if (view.numOfChapters) {
                    for (let i = 1; i <= view.numOfChapters; i += 1) {
                        elements.urlPath = urlPath + '-' + parseInt(i, 10)

                        let markdown = fs.readFileSync('./static/contents' + elements.urlPath + '.md', 'utf8')
                        elements.descriptions = {}
                        elements.descriptions.url = URL + elements.urlPath
                        elements.descriptions.cssPath = '/css/styles-others.css'
                        elements.descriptions.description = mustache.render(view.description, { 'chapter': i })
                        elements.descriptions.title = view.title + ' ' + parseInt(i, 10)

                        elements.descriptions.body = '<section class="section">'
                        elements.descriptions.body += '<div class="container">'
                        elements.descriptions.body += '<div class="content is-small">'
                        elements.descriptions.body += marked(markdown)
                        elements.descriptions.body += '</div>'
                        elements.descriptions.body += '</div>'
                        elements.descriptions.body += '</section>'

                        elements.descriptions.pagination = Pages.pagination(urlPath, i, view.numOfChapters)
                        this.pages.set(elements.urlPath, new Page(elements))
                    }
                } else {
                    const MARKDOWN = fs.readFileSync('./static/contents' + urlPath + '.md', 'utf8')
                    let contentHTML = '<section class="section">'
                    contentHTML += '<div class="container">'
                    contentHTML += '<div class="content is-small">'
                    contentHTML += marked(MARKDOWN)
                    contentHTML += '</div>'
                    contentHTML += '</div>'
                    contentHTML += '</section>'
                    elements.descriptions.body = contentHTML
                    this.pages.set(urlPath, new Page(elements))
                }
            }
        }
    }

    static pagination(urlPath, chapter, numOfChapters) {
        let paginationHTML = '<section class="section">'
        paginationHTML += '<nav class="pagination" role="navigation" aria-label="pagination">'
        paginationHTML += '<ul class="pagination-list">'

        for (let i = 1; i <= numOfChapters; i += 1) {
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
}


class Page {
    constructor(elements) {
        this.urlPath = elements.urlPath
        this.contentType = elements.contentType
        this.descriptions = elements.descriptions
        this.hasComments = elements.hasComments
        this.hasLikeCount = elements.hasLikeCount
        this.page = elements.page
    }

    title() {
        return this.descriptions.title
    }

    get(callback) {
        if (this.page) {
            callback(this.page)
            return
        }

        const urlPath = this.urlPath
        let descriptions = this.descriptions

        mongodbDriver.findPageLikes(urlPath, (pageLike) => {
            if (this.hasLikeCount) {
                descriptions.like = `<form method="post" action="${urlPath}">`
                descriptions.like += `<button class="button is-small is-primary is-outlined is-rounded" name="id" value=0>Like ${pageLike || 0}</button>`
                descriptions.like += '</form>'
            }

            if (this.hasComments) {
                let id = 0
                let commentsHTML = ''
                mongodbDriver.findComments(urlPath, (comments) => {
                    mongodbDriver.findLikes(urlPath, (likes) => {

                        for (let commentObj of comments) {
                            id += 1
                            commentObj.urlPath = urlPath
                            commentObj.id = id
                            commentObj.timestamp = dateString.str(commentObj.date)
                            commentObj.comment = mustache.render('{{raw}}', { 'raw': commentObj.comment })
                            commentObj.comment = commentObj.comment.replace(/\n/g, '<br>')
                            commentObj.like = likes[id] || 0
                            commentsHTML += mustache.render(TEMPLATE_COMMENT, commentObj)
                        }
                        descriptions.comments = mustache.render(
                            TEMPLATE_COMMENTSFIELD, {
                                urlPath,
                                'comments': commentsHTML
                            }
                        )
                        callback(mustache.render(TEMPLATE, descriptions))
                    })
                })
            } else {
                callback(mustache.render(TEMPLATE, descriptions))
            }
        })
    }
}
