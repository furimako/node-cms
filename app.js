const fs = require('fs')
const http = require('http')
const parse = require('url').parse
const join = require('path').join
const qs = require('querystring')
const logging = require('./server/logging')
const mongodbDriver = require('./server/mongodb_driver')
const Pages = require('./server/pages')
const root = __dirname
let pages = new Pages()

const json = fs.readFileSync('./server/views/views.json', 'utf8')
const views = JSON.parse(json)
pages.add(views)

const json_world = fs.readFileSync('./server/views/views-world.json', 'utf8')
const views_world = JSON.parse(json_world)
pages.add(views_world)

const json_story = fs.readFileSync('./server/views/views-story.json', 'utf8')
const views_story = JSON.parse(json_story)
pages.add(views_story)


// Start server
const server = http.createServer(requestListener)
let port = 8128
server.listen(port)
logging.info(`started server [port: ${port}]`)


function requestListener(request, res) {
    let urlPath = parse(request.url).pathname
    logging.info(`request [url: ${urlPath}]`)

    if (pages.has(urlPath)) {
        if (request.method === 'GET') {
            res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
            pages.addEndToResponse(res, urlPath)
            logging.info(`    L response page (GET)`)

        } else if (request.method === 'POST') {
            let body = ''
            request.on('data', (data) => {
                body += data
            })

            request.on('end', () => {
                const postData = qs.parse(body)
                logging.info(`    L get message [name: ${postData.name}, comment: ${postData.comment}`)
                mongodbDriver.insert(urlPath, postData)
            })

            res.writeHead(302, { Location: urlPath + '#comments-field' })
            pages.addEndToResponse(res, urlPath)
            logging.info(`    L response page (POST)`)
        }
    } else {
        let absPath = join(root, 'images', urlPath)
        fs.stat(absPath, (err, stat) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // When pages no found
                    res.writeHead(404, { 'Content-Type': 'text/html' })
                    pages.addEndToResponse(res, '/no-found')
                    logging.info(`    L response no-found`)

                } else {
                    // Internal Server Error
                    res.statusCode = 500
                    res.end('Internal Server Error')
                    logging.error(`internal server error (stat error)`)
                }
            } else {
                // Static files
                res.setHeader('Content-Length', stat.size)
                let stream = fs.createReadStream(absPath)
                stream.pipe(res)
                logging.info(`    L response static file`)

                stream.on('error', (err) => {
                    res.statusCode = 500
                    res.end('Internal Server Error')
                    logging.error(`internal server error (static file stream error)`)
                })
            }
        })
    }
}
