
module.exports = class Pages {
    constructor() {
        this.pages = new Map()
    }
    
    addPage (template, title, path) {
        const fs = require('fs')
        const marked = require('marked')
        const mustache = require('mustache')
        marked.setOptions({
          breaks: true
        })

        let markdown = fs.readFileSync('./static/markdown' + path + '.md', 'utf8')
        let html = marked(markdown)
        let html_rendered = mustache.render(template, {'title': title, 'body': html})
        this.pages.set(path, html_rendered)
    }
    
    has (path) {
        return this.pages.has(path)
    }
    
    get (path) {
        return this.pages.get(path)
    }
}
