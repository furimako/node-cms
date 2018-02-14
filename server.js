
const http = require('http')
const Pages = require('./js/pages')
const fs = require('fs')

const json = fs.readFileSync('./data/views.json', 'utf8')
let views = JSON.parse(json)
let pages = new Pages(views)

let elements = new Pages()
elements.addText('/node_modules/bulma/css/bulma.css')
elements.addBinary('/icon/favicon.png')
elements.addBinary('/icon/twitter.png')
elements.addBinary('/icon/github.png')

// Start server
let server = http.createServer(requestListenerFunction)
server.listen(8128)
console.log('Server Start')


function requestListenerFunction(request, response) {
    const urlPath = request.url
    
    if (pages.has(urlPath)) {
        response.writeHead(200, {'Content-Type' : 'text/html'})
        response.end(pages.get(urlPath))
        console.log(`response page (path: ${urlPath})`)
        
    } else if (elements.has(urlPath)) {
        response.writeHead(200, {'Content-Type' : elements.contentType(urlPath)})
        response.end(elements.get(urlPath))
        console.log(`response element (path: ${urlPath})`)
        
    } else {
        response.writeHead(404, {'Content-Type' : 'text/html'})
        response.end(pages.get(false))
        console.log(`response no-found (path: ${urlPath})`)
    }
}
