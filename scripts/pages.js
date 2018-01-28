
module.exports = class Pages {
    constructor() {
        this.pages = new Map()
    }
    
    addPage (title, urlPath, contentPath=false) {
        const fs = require('fs')
        let content_html

        if (contentPath) {
            content_html = fs.readFileSync(contentPath, 'utf8')
        } else {
            let markdown = fs.readFileSync('./static/markdown' + urlPath + '.md', 'utf8')
            const marked = require('marked')
            marked.setOptions({breaks: true})
            content_html = marked(markdown)
        }
        
        const mustache = require('mustache')
        const TEMPLATE = fs.readFileSync('./static/template.mustache', 'utf8')
        let html = mustache.render(TEMPLATE, {'title': title, 'body': content_html})
        this.pages.set(urlPath, html)
    }
    
    has (urlPath) {
        return this.pages.has(urlPath)
    }
    
    get (urlPath) {
        return this.pages.get(urlPath)
    }
}
