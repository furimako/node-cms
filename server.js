const http = require('http')
const fs = require('fs')
const url = require('url')
const Pages = require('./scripts/pages')

// Read files
const index_html = fs.readFileSync('./static/index.html', 'utf8')
const no_found_html = fs.readFileSync('./static/no-found.html', 'utf8')
const ideology_mustache = fs.readFileSync('./static/ideology.mustache', 'utf8')

// Create pages
let pages = new Pages()
pages.addPage(ideology_mustache, '「幸せ」を目指してはいけない', '/ideology/your-goal')
pages.addPage(ideology_mustache, 'あなたにとっての「幸せ」は？', '/ideology/happiness')
pages.addPage(ideology_mustache, '今を生きるためのちょっとしたヒント', '/ideology/tips-for-your-life')
pages.addPage(ideology_mustache, '「自由」に生きてはいけない', '/ideology/freedom')
pages.addPage(ideology_mustache, '「大人」について', '/ideology/grown-up')
pages.addPage(ideology_mustache, '理想の「教育」', '/ideology/education')
pages.addPage(ideology_mustache, '「哲学」は無意味である (仮)', '/ideology/philosophy')
pages.addPage(ideology_mustache, '「一番」を目指してはいけない', '/ideology/ideal-way-to-live-life')

// pages.addPage('/images/icon/icon.png', fs.readFileSync('./images/icon/icon.png', 'utf8'))

// Start server
let server = http.createServer(requestListenerFunction)
server.listen(8128)
console.log('Server Start')


function requestListenerFunction(request, response) {
    let path = url.parse(request.url).pathname
    
    if (path == '/') {
        response.end(index_html)
    } else if (pages.has(path)) {
        response.end(pages.get(path))
    } else {
        response.end(no_found_html)
    }
}
