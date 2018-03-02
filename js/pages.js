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

    writeToResponse(response) {
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
                        cursor.toArray(function(err, result) {
                            if (err) throw err

                            let commentsHTML = ''
                            for (let comment of result) {
                                commentsHTML += mustache.render(TEMPLATE_COMMENT, comment)
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
                    let markdowns = []
                    for (let i = 1; i <= view.numOfChapters; i++) {
                        markdowns[i] = fs.readFileSync('./static' + urlPath + '-' + parseInt(i) + '.md', 'utf8')
                    }

                    for (let i = 1; i <= view.numOfChapters; i++) {
                        let pagination = `<section class="section"><nav class="pagination" role="navigation" aria-label="pagination"><ul class="pagination-list">`
                        for (let j = 1; j <= view.numOfChapters; j++) {
                            if (i === j) {
                                pagination += `<li><a class="pagination-link is-current" href="${urlPath + '-' + parseInt(j)}">${parseInt(j)}</a></li>`
                            } else {
                                pagination += `<li><a class="pagination-link" href="${urlPath + '-' + parseInt(j)}">${parseInt(j)}</a></li>`
                            }
                        }
                        pagination += `</ul></nav></section>`

                        descriptions.description = mustache.render(view.description, { 'chapter': i })
                        descriptions.title = view.title + ' ' + parseInt(i)
                        descriptions.body = '<section class="section"><div class="container"><div class="content">' + marked(markdowns[i]) + '</div></div></section>'
                        descriptions.pagination = pagination
                        this.pages.set(urlPath + '-' + parseInt(i), new Page(urlPath + '-' + parseInt(i), contentType, descriptions, hasComments, page))
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

    has(urlPath) {
        return this.pages.has(urlPath)
    }

    writeToResponse(response, urlPath) {
        return this.pages.get(urlPath).writeToResponse(response)
    }

    contentType(urlPath) {
        return this.pages.get(urlPath).contentType
    }
}
