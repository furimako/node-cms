const fs = require('fs')
const http = require('http')
const url = require('url')
const qs = require('querystring')
const r = require('rethinkdb')
const Pages = require('./js/pages')

let pages = new Pages()

const json = fs.readFileSync('./data/views.json', 'utf8')
const views = JSON.parse(json)
pages.add(views)

const json_world = fs.readFileSync('./data/views-world.json', 'utf8')
const views_world = JSON.parse(json_world)
pages.add(views_world)

const json_story = fs.readFileSync('./data/views-story.json', 'utf8')
const views_story = JSON.parse(json_story)
pages.add(views_story)

// Start server
const server = http.createServer(requestListenerFunction)
server.listen(8128)
console.log('Server Start')


function requestListenerFunction(request, response) {
    console.log(`get request from ${request.url}`)
    let urlPath = url.parse(request.url, true).pathname

    if (pages.has(urlPath)) {
        if (urlPath.endsWith('/comment') && request.method == 'POST') {
            urlPath = urlPath.slice(0, -8)

            // POST
            let body = ''
            request.on('data', (data) => {
                body += data
            })

            request.on('end', () => {
                const postData = qs.parse(body)
                console.log(`get message [name: ${postData.name}, comment: ${postData.comment}`)

                let connection = null
                r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
                    if (err) throw err
                    connection = conn

                    r.db('FullyHatter').table('comments').insert({
                        urlPath: urlPath,
                        date: new Date(),
                        name: postData.name,
                        comment: postData.comment
                    }).run(connection, function(err, res) {
                        if (err) throw err
                        console.log(JSON.stringify(res))
                    })
                })
            })
            response.writeHead(302, { Location: urlPath + '#comments-field' })
            pages.writeToResponse(response, urlPath)
            console.log(`redirect (path: ${urlPath})`)

        } else {
            // GET
            response.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
            pages.writeToResponse(response, urlPath)
            console.log(`response page (path: ${urlPath})`)
        }


    } else {
        response.writeHead(404, { 'Content-Type': 'text/html' })
        pages.writeToResponse(response, '/no-found')
        console.log(`response no-found (path: ${urlPath})`)
    }
}
