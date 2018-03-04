const fs = require('fs')
const r = require('rethinkdb')
const mustache = require('mustache')
const marked = require('marked')
marked.setOptions({
    breaks: true
})
const sass = require('node-sass')

const TEMPLATE = fs.readFileSync('./static/template.mustache', 'utf8')
const TEMPLATE_COMMENTSFIELD = fs.readFileSync('./static/comments-field.mustache', 'utf8')
const TEMPLATE_COMMENT = fs.readFileSync('./static/comment.mustache', 'utf8')


class Page {
    constructor(urlPath, contentType, descriptions, hasComments, page) {
        this.urlPath = urlPath
        this.contentType = contentType
        this.descriptions = descriptions
        this.hasComments = hasComments
        this.page = page
    }

    writeEndToResponse(response) {
        if (this.page) {
            response.end(this.page)
        }

        const urlPath = this.urlPath
        const descriptions = this.descriptions

        if (this.hasComments) {
            let connection = null
            r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
                if (err) throw err
                connection = conn

                r.db('FullyHatter').table('comments').filter({ urlPath: urlPath }).run(
                    connection,
                    function(err, cursor) {
                        if (err) throw err
                        cursor.toArray(function(err, commentObjList) {
                            if (err) throw err

                            const sortedList = commentObjList.sort((commentObj1, commentObj2) =>
                                commentObj1.date.getTime() - commentObj2.date.getTime()
                            )
                            let commentsHTML = ''
                            for (let commentObj of sortedList) {
                                let date = commentObj.date
                                commentObj.timestamp = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
                                commentObj.comment = mustache.render('{{commentText}}', { commentText: commentObj.comment })
                                commentObj.comment = marked(commentObj.comment)
                                commentsHTML += mustache.render(TEMPLATE_COMMENT, commentObj)
                            }
                            descriptions.comments = mustache.render(
                                TEMPLATE_COMMENTSFIELD, {
                                    'urlPath': urlPath,
                                    'comments': commentsHTML
                                }
                            )
                            const html = mustache.render(TEMPLATE, descriptions)
                            response.end(html)
                        })
                    }
                )
            })
        } else {
            const html = mustache.render(TEMPLATE, descriptions)
            response.end(html)
        }
    }
}


module.exports = class Pages {
    constructor() {
        this.pages = new Map()
    }

    has(urlPath) {
        return this.pages.has(urlPath)
    }

    writeEndToResponse(response, urlPath) {
        this.pages.get(urlPath).writeEndToResponse(response)
    }

    contentType(urlPath) {
        return this.pages.get(urlPath).contentType
    }

    add(views) {
        for (const view of views) {
            const urlPath = view.urlPath
            const hasComments = view.comments
            let contentType = ''
            let descriptions = {}
            let page = ''

            if (urlPath === '/styles.css') {
                // CSS
                const SCSS = fs.readFileSync('./static/styles.scss', 'utf8')
                contentType = 'text/css'
                page = sass.renderSync({ data: SCSS }).css
                this.pages.set(urlPath, new Page(urlPath, contentType, descriptions, hasComments, page))

            } else if (urlPath.match(/\.png$/)) {
                // PNG
                contentType = 'image/png'
                page = fs.readFileSync('.' + urlPath)
                this.pages.set(urlPath, new Page(urlPath, contentType, descriptions, hasComments, page))

            } else if (urlPath.match(/\.jpg$/)) {
                // JPEG
                contentType = 'image/jpeg'
                page = fs.readFileSync('.' + urlPath)
                this.pages.set(urlPath, new Page(urlPath, contentType, descriptions, hasComments, page))

            } else {
                // HTML
                contentType = 'text/html'

                if (view.filePath) {
                    const contentHTML = fs.readFileSync(view.filePath, 'utf8')

                    descriptions.description = view.description
                    descriptions.title = view.title
                    descriptions.body = contentHTML
                    this.pages.set(urlPath, new Page(urlPath, contentType, descriptions, hasComments, page))

                } else if (view.numOfChapters) {
                    for (let i = 1; i <= view.numOfChapters; i++) {
                        let markdown = fs.readFileSync('./static' + urlPath + '-' + parseInt(i) + '.md', 'utf8')
                        let desc = {}
                        desc.description = mustache.render(view.description, { 'chapter': i })
                        desc.title = view.title + ' ' + parseInt(i)
                        desc.body = '<section class="section"><div class="container"><div class="content">' + marked(markdown) + '</div></div></section>'
                        desc.pagination = this.getPagination(urlPath, i, view.numOfChapters)
                        this.pages.set(urlPath + '-' + parseInt(i), new Page(urlPath + '-' + parseInt(i), contentType, desc, hasComments, page))
                    }
                } else {
                    const MARKDOWN = fs.readFileSync('./static' + urlPath + '.md', 'utf8')
                    const contentHTML = '<section class="section"><div class="container"><div class="content">' + marked(MARKDOWN) + '</div></div></section>'

                    descriptions.description = view.description
                    descriptions.title = view.title
                    descriptions.body = contentHTML
                    this.pages.set(urlPath, new Page(urlPath, contentType, descriptions, hasComments, page))
                    if (view.comments) {
                        this.pages.set(urlPath + '/comment', false)
                    }
                }
            }
        }
    }

    getPagination(urlPath, chapter, numOfChapters) {
        let pagination = `<section class="section"><nav class="pagination" role="navigation" aria-label="pagination"><ul class="pagination-list">`
        for (let i = 1; i <= numOfChapters; i++) {
            if (i === chapter) {
                pagination += `<li><a class="pagination-link is-current" href="${urlPath + '-' + parseInt(i)}">${parseInt(i)}</a></li>`
            } else {
                pagination += `<li><a class="pagination-link" href="${urlPath + '-' + parseInt(i)}">${parseInt(i)}</a></li>`
            }
        }
        pagination += `</ul></nav></section>`
        return pagination
    }
}
