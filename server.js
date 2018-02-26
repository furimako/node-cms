
const http = require('http')
const Pages = require('./js/pages')
const fs = require('fs')

const json = fs.readFileSync('./data/views.json', 'utf8')
let views = JSON.parse(json)
let pages = new Pages(views)

// Start server
let server = http.createServer(requestListenerFunction)
server.listen(8128)
console.log('Server Start')


function requestListenerFunction(request, response) {
    console.log(`get request from ${request.url}`)
    const urlPath = url.parse(request.url, true)
    
    if (pages.has(urlPath)) {
        response.writeHead(200, {'Content-Type' : pages.contentType(urlPath)})
        response.end(pages.get(urlPath))
        console.log(`response page (path: ${urlPath})`)
        
    } else if (urlPath === '/comments') {
        
    } else {
        response.writeHead(404, {'Content-Type' : 'text/html'})
        response.end(pages.get(false))
        console.log(`response no-found (path: ${urlPath})`)
    }
}
