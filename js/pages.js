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
        this.homeView = {}
        this.homeView.world = []
        this.homeView.story = []
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

    add(views, type = false) {
        for (const view of views) {
            const urlPath = view.urlPath
            let elements = {}
            elements.urlPath = urlPath
            if (view.isNew) {
                elements.new = '<span class="tag is-danger">New!</span>'
            }
            
            if (type) {
                this.homeView[type].push({
                    url: (view.numOfChapters) ? urlPath + '-1' : urlPath,
                    urlPicture: '/images' + urlPath + '.jpg',
                    title: view.title,
                    description: view.description,
                    new: elements.new
                })
            }
            
            if (urlPath.match(/\.css$/)) {
                // CSS
                elements.contentType = 'text/css'
                const SCSS = fs.readFileSync('./static/scss/' + path.basename(urlPath, '.css') + '.scss', 'utf8')
                elements.page = sass.renderSync({ data: SCSS }).css
                this.pages.set(urlPath, new Page(elements))
                continue
            } 
            
            if (urlPath.match(/\.png$/)) {
                // PNG
                elements.contentType = 'image/png'
                elements.page = fs.readFileSync('./static' + urlPath)
                this.pages.set(urlPath, new Page(elements))
                continue
            }
            
            if (urlPath.match(/\.jpg$/)) {
                // JPEG
                elements.contentType = 'image/jpeg'
                elements.page = fs.readFileSync('./static' + urlPath)
                this.pages.set(urlPath, new Page(elements))
                continue
            }
            
            // HTML
            elements.contentType = 'text/html'
            elements.descriptions = {}
            elements.descriptions.url = URL + urlPath
            elements.descriptions.cssPath = '/css/styles-others.css'
            elements.descriptions.description = view.description
            elements.descriptions.title = view.title
            elements.hasComments = view.comments
            elements.hasLikeCount = view.like

            if (view.filePath && urlPath === '/') {
                // Content = Home
                elements.template = fs.readFileSync(view.filePath, 'utf8')
                elements.descriptions.cssPath = '/css/styles-home.css'
                elements.homeView = this.homeView
                this.pages.set(urlPath, new Page(elements))
                continue
            }
            
            if (view.filePath) {
                // Content = HTML
                const contentHTML = fs.readFileSync(view.filePath, 'utf8')
                elements.descriptions.body = contentHTML
                this.pages.set(urlPath, new Page(elements))
                continue
            }
            
            if (view.numOfChapters) {
                // Content = MARKDOWNs
                for (let i = 1; i <= view.numOfChapters; i++) {
                    elements.urlPath = urlPath + '-' + parseInt(i, 10)
                    elements.urlBase = urlPath + '-1'

                    let markdown = fs.readFileSync('./static/contents' + elements.urlPath + '.md', 'utf8')
                    elements.descriptions = {}
                    elements.descriptions.url = URL + elements.urlPath
                    elements.descriptions.cssPath = '/css/styles-others.css'
                    elements.descriptions.description = view.description
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
                continue
            }
            
            // Content = MARKDOWN
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

    static pagination(urlPath, chapter, numOfChapters) {
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
}


class Page {
    constructor(elements) {
        this.urlPath = elements.urlPath
        this.urlBase = elements.urlBase
        this.contentType = elements.contentType
        this.descriptions = elements.descriptions
        this.hasComments = elements.hasComments
        this.hasLikeCount = elements.hasLikeCount
        this.page = elements.page
        this.template = elements.template
        this.homeView = elements.homeView
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
        
        if (urlPath === '/') {
            mongodbDriver.findSummary((summary) => {
                let homeView = this.homeView
                
                for (let i = 0; i < homeView.world.length; i++) {
                    homeView.world[i].likeCount = summary.like[homeView.world[i].url] || 0
                    homeView.world[i].commentCount = summary.comment[homeView.world[i].url] || 0
                    
                    if (i === 0) {
                        homeView.world[i].head = '<div class="column">'
                    }
                    if (i === Math.floor((homeView.world.length - 1) / 2)) {
                        homeView.world[i].foot = '</div>'
                        homeView.world[i].foot += '<div class="column">'
                    }
                    if (i === homeView.world.length - 1) {
                        homeView.world[i].foot = '</div>'
                    }
                }
                
                for (let i = 0; i < homeView.story.length; i++) {
                    homeView.story[i].likeCount = summary.like[homeView.story[i].url] || 0
                    
                    if (i === 0) {
                        homeView.story[i].head = '<div class="column">'
                    }
                    if (i === Math.floor((homeView.story.length - 1) / 2)) {
                        homeView.story[i].foot = '</div>'
                        homeView.story[i].foot += '<div class="column">'
                    }
                    if (i === homeView.story.length - 1) {
                        homeView.story[i].foot = '</div>'
                    }
                }
                
                descriptions.body = mustache.render(this.template, homeView)
                callback(mustache.render(TEMPLATE, descriptions))
            })
            return
        }

        mongodbDriver.findPageLikes(this.urlBase || urlPath, (pageLike) => {
            if (this.hasLikeCount) {
                descriptions.like = `<form method="post" action="${this.urlBase || urlPath}">`
                descriptions.like += `<button class="button is-small is-primary is-outlined is-rounded" name="id" value=0>Like ${pageLike || 0}</button>`
                descriptions.like += '</form>'
            }

            if (this.hasComments) {
                let id = 0
                let commentsHTML = ''
                mongodbDriver.findComments(urlPath, (comments) => {
                    mongodbDriver.findLikes(urlPath, (likes) => {
                        for (let commentObj of comments) {
                            id++
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
