
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
                this.add(view)
            }
        }
    }
    
    add(view) {
        if (!view.urlPath) {
            this.addHTML(view)
            
        } else if (view.urlPath === "/styles.css") {
            const SCSS = this.fs.readFileSync('./static/styles.scss', 'utf8')
            
            const sass = require('node-sass')
            const STYLES = sass.renderSync({data: SCSS})
            this.pages.set(view.urlPath, STYLES.css)
            this.contentTypes.set(view.urlPath, 'text/css')
            
        } else if (view.urlPath.match(/\.png$/)) {
            const BINARY = this.fs.readFileSync('.' + view.urlPath)
            this.pages.set(view.urlPath, BINARY)
            this.contentTypes.set(view.urlPath, 'image/png')
            
        } else if (view.numOfChapters) {
            this.addHTMLs(view)
            
        } else {
            this.addHTML(view)
        }
    }
    
    addHTML (view) {
        let contentHTML
        if (view.filePath) {
            contentHTML = this.fs.readFileSync(view.filePath, 'utf8')
        } else {
            const MARKDOWN = this.fs.readFileSync('./static' + view.urlPath + '.md', 'utf8')
            contentHTML = '<div class="content">' + this.marked(MARKDOWN) + '</div>'
        }
        
        let formHTML = ''
        if (view.form) {
            formHTML = this.fs.readFileSync('./static/form.html', 'utf8')
        }
        
        const HTML = this.mustache.render(this.TEMPLATE,
            {
                'description': view.description,
                'title': view.title,
                'body': contentHTML,
                'form': formHTML
            }
        )
        this.pages.set(view.urlPath, HTML)
        this.contentTypes.set(view.urlPath, 'text/html')
    }

    addHTMLs (view) {
        let markdowns = []
        for (let i = 1; i <= view.numOfChapters; i++) {
            markdowns[i] = this.fs.readFileSync('./static' + view.urlPath + '-' + parseInt(i) + '.md', 'utf8')
        }
        
        for (let i = 1; i <= view.numOfChapters; i++) {
            let pagination = `<nav class="pagination" role="navigation" aria-label="pagination"><ul class="pagination-list">`
            for (let j = 1; j <= view.numOfChapters; j++) {
                if (i === j) {
                    pagination += `<li><a class="pagination-link is-current" href="${view.urlPath + '-' + parseInt(j)}">${parseInt(j)}</a></li>`
                } else {
                    pagination += `<li><a class="pagination-link" href="${view.urlPath + '-' + parseInt(j)}">${parseInt(j)}</a></li>`
                }
            }
            pagination += `</ul></nav>`
            
            let formHTML = ''
            if (view.form) {
                formHTML = this.fs.readFileSync('./static/form.html', 'utf8')
            }
            
            const HTML = this.mustache.render(
                this.TEMPLATE,
                {
                    'description': this.mustache.render(view.description, {'chapter': i}),
                    'title': (view.title + ' ' + parseInt(i)),
                    'body': '<div class="content">' + this.marked(markdowns[i]) + '</div>',
                    'pagination': pagination,
                    'form': formHTML
                }
            )
            this.pages.set(view.urlPath + '-' + parseInt(i), HTML)
            this.contentTypes.set(view.urlPath + '-' + parseInt(i), 'text/html')
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
