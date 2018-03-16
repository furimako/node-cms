const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const mongoUrl = 'mongodb://localhost:27017/fully-hatter'
const mustache = require('mustache')
const marked = require('marked')
marked.setOptions({
    breaks: true
})
const sass = require('node-sass')
const logging = require('./logging')

const TEMPLATE = fs.readFileSync('./static/template.mustache', 'utf8')
const TEMPLATE_COMMENT = fs.readFileSync('./static/comment.mustache', 'utf8')
const TEMPLATE_COMMENTSFIELD = fs.readFileSync('./static/comments-field.mustache', 'utf8')


module.exports = class Pages {
    constructor() {
        this.pages = new Map()
    }

    has(urlPath) {
        return this.pages.has(urlPath)
    }

    addEndToResponse(response, urlPath) {
        return this.pages.get(urlPath).addEndToResponse(response)
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


class Page {
    constructor(urlPath, contentType, descriptions, hasComments, page) {
        this.urlPath = urlPath
        this.contentType = contentType
        this.descriptions = descriptions
        this.hasComments = hasComments
        this.page = page
    }

    addEndToResponse(response) {
        if (this.page) {
            response.end(this.page)
            return
        }

        const urlPath = this.urlPath
        const descriptions = this.descriptions

        if (this.hasComments) {
            MongoClient.connect(mongoUrl, (err, db) => {
                assert.equal(null, err)
                logging.info('    L connected successfully to server')
                addEndToResponseFromDB(response, urlPath, descriptions, db, () => { db.close() })
            })
        } else {
            response.end(mustache.render(TEMPLATE, descriptions))
        }
    }
}


let addEndToResponseFromDB = (response, urlPath, descriptions, db, callback) => {
    let collection = db.db('fully-hatter').collection('comments')
    collection.find({ 'urlPath': urlPath }).toArray((err, docs) => {
        assert.equal(err, null)
        logging.info(`    L found ${docs.length} document(s)`)

        const commentObjList = docs.sort((commentObj1, commentObj2) =>
            commentObj1.date.getTime() - commentObj2.date.getTime()
        )

        let commentsHTML = ''
        for (let commentObj of commentObjList) {
            let date = commentObj.date
            commentObj.timestamp = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${('00' + date.getHours()).slice(-2)}:${('00' + date.getMinutes()).slice(-2)}`
            commentObj.comment = commentObj.comment.replace(/\*/g, '＊')
            commentObj.comment = commentObj.comment.replace(/\-/g, 'ー')
            commentObj.comment = commentObj.comment.replace(/#/g, '＃')
            commentObj.comment = commentObj.comment.replace(/_/g, '＿')
            commentObj.comment = commentObj.comment.replace(/</g, '＜')
            commentObj.comment = commentObj.comment.replace(/>/g, '＞')
            commentObj.comment = marked(commentObj.comment)
            commentsHTML += mustache.render(TEMPLATE_COMMENT, commentObj)
        }
        descriptions.comments = mustache.render(
            TEMPLATE_COMMENTSFIELD, {
                'urlPath': urlPath,
                'comments': commentsHTML
            }
        )
        response.end(mustache.render(TEMPLATE, descriptions))
        callback(docs)
    })
}
