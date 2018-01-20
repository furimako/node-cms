const http = require('http')
const fs = require('fs')
const url = require('url')

var server = http.createServer(requestListenerFunction)
server.listen(8128)
console.log('Server Start')


function requestListenerFunction(request, response) {
    var url_parts = url.parse(request.url)
    var target
    var contentType
    switch (url_parts.pathname) {
        case "/":
            target = './static/index.html'
            contentType = 'text/html'
            break
        case "/markdown.css":
            target = './static/markdown.css'
            contentType = 'text/css'
            break
        default:
            response.writeHead(200, {
                'Content-Type': 'plain'
            })
            response.end('no page...')
            return
    }

    fs.readFile(target, 'UTF-8',
        (error, data) => {
            response.writeHead(200, {
                'Content-Type': contentType
            })
            response.write(data)
            response.end()
        }
    )
}