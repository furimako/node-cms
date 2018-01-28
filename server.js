
const http = require('http')
const url = require('url')
const Pages = require('./scripts/pages')

// Create pages
let pages = new Pages()
pages.addPage('Home', '/', './static/index.html')
pages.addPage('No Found', false, './static/no-found.html')
pages.addPage('「幸せ」を目指してはいけない', '/ideology/your-goal')
pages.addPage('あなたにとっての「幸せ」は？', '/ideology/happiness')
pages.addPage('今を生きるためのちょっとしたヒント', '/ideology/tips-for-your-life')
pages.addPage('「自由」に生きてはいけない', '/ideology/freedom')
pages.addPage('「大人」について', '/ideology/grown-up')
pages.addPage('理想の「教育」', '/ideology/education')
pages.addPage('「哲学」は無意味である (仮)', '/ideology/philosophy')
pages.addPage('「一番」を目指してはいけない', '/ideology/ideal-way-to-live-life')

// Start server
let server = http.createServer(requestListenerFunction)
server.listen(8128)
console.log('Server Start')


function requestListenerFunction(request, response) {
    let path = url.parse(request.url).pathname
    if (pages.has(path)) {
        response.end(pages.get(path))
    } else {
        response.end(pages.get(false))
    }
}
