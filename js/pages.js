
const fs = require('fs')
const path = require('path')
const sass = require('node-sass')
const Page = require('./page')


module.exports = class Pages {
    constructor(url) {
        this.url = url
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
        views.forEach((view) => { this.addView(view, type) })
    }
    
    addView(view, type) {
        if (type) {
            this.viewHome[type].push({
                urlPath: (view.numOfChapters) ? `${view.urlPath}-1` : view.urlPath,
                picturePath: `/images${view.urlPath}.jpg`,
                title: view.title,
                description: view.description,
                newTag: (view.isNew) ? '<span class="tag is-danger">New!</span>' : ''
            })
        }
        
        const page = new Page(this.url)
        
        if (view.urlPath.match(/\.css$/)) {
            // CSS
            const scss = fs.readFileSync(`./static/scss/${path.basename(view.urlPath, '.css')}.scss`, 'utf8')
            const { css } = sass.renderSync({ data: scss })
            page.setContentType('text/css')
            page.setContent(css)
            this.pages.set(view.urlPath, page)
            return
        }
        
        if (view.urlPath.match(/\.png$/)) {
            // PNG
            const png = fs.readFileSync(`./static${view.urlPath}`)
            page.setContentType('image/png')
            page.setContent(png)
            this.pages.set(view.urlPath, page)
            return
        }
        
        if (view.urlPath.match(/\.jpg$/)) {
            // JPEG
            page.setContentType('image/jpeg')
            const jpg = fs.readFileSync(`./static${view.urlPath}`)
            page.setContent(jpg)
            this.pages.set(view.urlPath, page)
            return
        }
        
        // HTML
        page.setContentType('text/html')
        page.render(view.urlPath, view.title, view.description, view.isNew)
        page.set(view.hasCommentsField, view.hasLikeButton)
        
        if (view.urlPath === '/') {
            // Content = Home
            page.setViewHome(this.viewHome)
            this.pages.set(view.urlPath, page)
            return
        }
        
        if (view.numOfChapters) {
            // Content = MARKDOWNs
            for (let i = 1; i <= view.numOfChapters; i += 1) {
                const pageWithChapters = new Page(this.url)
                pageWithChapters.setContentType('text/html')
                pageWithChapters.render(view.urlPath, view.title, view.description, view.isNew, view.numOfChapters, i)
                pageWithChapters.renderBodyHTML(view.urlPath, i)
                pageWithChapters.set(view.hasCommentsField, view.hasLikeButton)
                this.pages.set(`${view.urlPath}-${i}`, pageWithChapters)
            }
            return
        }
        
        if (view.filePath) {
            // Content = HTML
            page.renderBodyHTML(view.filePath)
        } else {
            // Content = MARKDOWN
            page.renderBodyHTML(view.urlPath)
        }
        this.pages.set(view.urlPath, page)
    }
}
