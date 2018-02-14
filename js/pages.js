
module.exports = class Pages {
    constructor(views) {
        this.pages = new Map()
        this.contentTypes = new Map()
        
        this.fs = require('fs')
        this.mustache = require('mustache')
        this.marked = require('marked')
        this.marked.setOptions({breaks: true})
        this.TEMPLATE = this.fs.readFileSync('./static/template.mustache', 'utf8')
        
        if (views) {
            for (let view of views) {
                if(view.numOfChapters) {
                    this.addHTMLs(view)
                } else {
                    this.addHTML(view)
                }
            }
        }
    }
    
    addHTML (view) {
        let contentHTML
        if (view.filePath) {
            contentHTML = this.fs.readFileSync(view.filePath, 'utf8')
        } else {
            const MARKDOWN = this.fs.readFileSync('./static' + view.urlPath + '.md', 'utf8')
            contentHTML = this.marked(MARKDOWN)
        }
        
        const HTML = this.mustache.render(this.TEMPLATE, {'description': view.description, 'title': view.title, 'body': contentHTML})
        this.pages.set(view.urlPath, HTML)
    }

    addHTMLs (view) {
        let markdowns = []
        for (let i = 1; i <= view.numOfChapters; i++) {
            markdowns[i] = this.fs.readFileSync('./static' + view.urlPath + '-' + parseInt(i) + '.md', 'utf8')
        }
        
        for (let i = 1; i <= view.numOfChapters; i++) {
            let pagination = `
                <nav class="pagination" role="navigation" aria-label="pagination">
                    <ul class="pagination-list">`
            for (let j = 1; j <= view.numOfChapters; j++) {
                if (i === j) {
                    pagination += `
                        <li>
                            <a class="pagination-link is-current" href="${view.urlPath + '-' + parseInt(j)}">${parseInt(j)}</a>
                        </li>`
                } else {
                    pagination += `
                        <li>
                            <a class="pagination-link" href="${view.urlPath + '-' + parseInt(j)}">${parseInt(j)}</a>
                        </li>`
                }
            }
            pagination += `</ul></nav>`
            const HTML = this.mustache.render(
                this.TEMPLATE,
                {
                    'description': this.mustache.render(view.description, {'chapter': i}),
                    'title': (view.title + ' ' + parseInt(i)),
                    'body': this.marked(markdowns[i]),
                    'pagination': pagination
                }
            )
            this.pages.set(view.urlPath + '-' + parseInt(i), HTML)
        }
    }
    
    addText (urlPath) {
        const TEXT = this.fs.readFileSync('.' + urlPath, 'utf8')
        this.pages.set(urlPath, TEXT)
        
        if (urlPath.match(/\.css$/)) {
            this.contentTypes.set(urlPath, 'text/css')
        }
    }
    
    addBinary (urlPath) {
        const BINARY = this.fs.readFileSync('.' + urlPath)
        this.pages.set(urlPath, BINARY)
        
        if (urlPath.match(/\.png$/)) {
            this.contentTypes.set(urlPath, 'image/png')
        }
    }
    
    has (urlPath) {
        return this.pages.has(urlPath)
    }
    
    get (urlPath) {
        return this.pages.get(urlPath)
    }
    
    contentType (urlPath) {
        return this.contentTypes.get(urlPath)
    }
}
