
const fs = require('fs')
const path = require('path')
const sass = require('node-sass')
const Page = require('./page')


module.exports = class Pages {
    constructor() {
        this.pages = new Map()
        this.viewHome = {}
        this.viewHome.world = []
        this.viewHome.story = []
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
        return this.pages.get(urlPath).title
    }

    add(views, type = false) {
        for (const view of views) {
            if (type) {
                this.viewHome[type].push({
                    urlPath: (view.numOfChapters) ? view.urlPath + '-1' : view.urlPath,
                    picturePath: '/images' + view.urlPath + '.jpg',
                    title: view.title,
                    description: view.description,
                    newTag: (view.isNew) ? '<span class="tag is-danger">New!</span>' : ''
                })
            }
            
            if (view.urlPath.match(/\.css$/)) {
                // CSS
                const SCSS = fs.readFileSync('./static/scss/' + path.basename(view.urlPath, '.css') + '.scss', 'utf8')
                const CSS = sass.renderSync({ data: SCSS }).css
                let page = new Page()
                page.setContentType('text/css')
                page.setContent(CSS)
                this.pages.set(view.urlPath, page)
                continue
            } 
            
            if (view.urlPath.match(/\.png$/)) {
                // PNG
                const PNG = fs.readFileSync('./static' + view.urlPath)
                let page = new Page()
                page.setContentType('image/png')
                page.setContent(PNG)
                this.pages.set(view.urlPath, page)
                continue
            }
            
            if (view.urlPath.match(/\.jpg$/)) {
                // JPEG
                let page = new Page()
                page.setContentType('image/jpeg')
                const JPG = fs.readFileSync('./static' + view.urlPath)
                page.setContent(JPG)
                this.pages.set(view.urlPath, page)
                continue
            }
            
            // HTML
            let page = new Page()
            page.setContentType('text/html')
            page.render(view.urlPath, view.title, view.description, view.isNew)
            page.set(view.hasCommentsField, view.hasLikeButton)
            
            if (view.urlPath === '/') {
                page.setViewHome(this.viewHome)
                this.pages.set(view.urlPath, page)
                continue
            }
            
            if (view.filePath) {
                // Content = HTML
                page.renderBody(view.filePath)
                this.pages.set(view.urlPath, page)
                continue
            }
            
            if (view.numOfChapters) {
                // Content = MARKDOWNs
                for (let i = 1; i <= view.numOfChapters; i++) {
                    let pageWithChapters = new Page()
                    pageWithChapters.setContentType('text/html')
                    pageWithChapters.render(view.urlPath, view.title, view.description, view.isNew, view.numOfChapters, i)
                    pageWithChapters.set(view.hasCommentsField, view.hasLikeButton)
                    this.pages.set(view.urlPath + '-' + i, pageWithChapters)
                }
                continue
            }
            
            // Content = MARKDOWN
            page.renderMarkdown(view.urlPath)
            this.pages.set(view.urlPath, page)
        }
    }
}
