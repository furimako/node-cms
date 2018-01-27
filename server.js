const http = require('http')
const fs = require('fs')
const url = require('url')
const mustache = require('mustache')
const marked = require('marked')

marked.setOptions({
  breaks: true
})

// Read files
const no_found_html = fs.readFileSync('./static/no-found.html', 'utf8')
const template_mustache = fs.readFileSync('./static/template.mustache', 'utf8')

// Create pages
let pages = new Map()
pages.set('/', getHTML('Home', './static/markdown/index.md'))
pages.set('/ideology/your-goal', getHTML('「幸せ」を目指してはいけない', './static/markdown/ideology/your-goal.md'))
pages.set('/ideology/happiness', getHTML('あなたにとっての「幸せ」は？', './static/markdown/ideology/happiness.md'))
pages.set('/ideology/tips-for-your-life', getHTML('今を生きるためのちょっとしたヒント', './static/markdown/ideology/tips-for-your-life.md'))
pages.set('/ideology/freedom', getHTML('「自由」に生きてはいけない', './static/markdown/ideology/freedom.md'))
pages.set('/ideology/grown-up', getHTML('「大人」について', './static/markdown/ideology/grown-up.md'))
pages.set('/ideology/education', getHTML('理想の「教育」', './static/markdown/ideology/education.md'))
pages.set('/ideology/philosophy', getHTML('「哲学」は無意味である (仮)', './static/markdown/ideology/philosophy.md'))
pages.set('/ideology/ideal-way-to-live-life', getHTML('「一番」を目指してはいけない', './static/markdown/ideology/ideal-way-to-live-life.md'))

// Start server
let server = http.createServer(requestListenerFunction)
server.listen(8128)
console.log('Server Start')


function getHTML(title, filePath) {
    let markdown = fs.readFileSync(filePath, 'utf8')
    let html = marked(markdown)
    return mustache.render(template_mustache, {"title": title, "body": html})
}


function requestListenerFunction(request, response) {
    response.writeHead(200, {'Content-Type': 'text/html'})
    let urlPath = url.parse(request.url).pathname
    
    if (pages.has(urlPath)) {
        response.write(pages.get(urlPath))
    } else {
        response.write(no_found_html)
    }
    response.end()
}
