const fs = require('fs')
const http = require('http')
const parse = require('url').parse
const qs = require('querystring')
const JSON5 = require('json5')
const logging = require('./server/logging')
const mailer = require('./server/mailer')
const Pages = require('./server/pages')
const mongodbDriver = require('./server/mongodb_driver')
let pages = new Pages()

const json5 = fs.readFileSync('./server/views/views.json5', 'utf8')
const json5_css = fs.readFileSync('./server/views/views-css.json5', 'utf8')
const json5_images = fs.readFileSync('./server/views/views-images.json5', 'utf8')
const json5_world = fs.readFileSync('./server/views/views-world.json5', 'utf8')
const json5_story = fs.readFileSync('./server/views/views-story.json5', 'utf8')
pages.add(JSON5.parse(json5))
pages.add(JSON5.parse(json5_css))
pages.add(JSON5.parse(json5_images))
pages.add(JSON5.parse(json5_world))
pages.add(JSON5.parse(json5_story))


// Start server
const server = http.createServer(requestListener)
const PORT = 8128
server.listen(PORT)
logging.info(`started server [port: ${PORT}]`)


function requestListener(request, res) {
    let urlPath = parse(request.url).pathname
    logging.info(`request [url: ${urlPath}]`)

    if (pages.has(urlPath)) {
        if (request.method === 'GET') {
            res.writeHead(200, { 'Content-Type': pages.contentType(urlPath) })
            pages.addEndToResponse(res, urlPath)

        } else if (request.method === 'POST') {
            let body = ''
            request.on('data', (data) => {
                body += data
            })

            request.on('end', () => {
                const postData = qs.parse(body)
                logging.info(`    L get message [name: ${postData.name}, comment: ${postData.comment}`)
                mailer.send(
                    `[Fully Hatter の秘密の部屋] get comment from '${postData.name}'`,
                    `Target: ${pages.title(urlPath)}\nURL: ${urlPath}`
                )
                mongodbDriver.insert(urlPath, postData)
            })

            res.writeHead(302, { Location: urlPath + '#comments-field' })
            pages.addEndToResponse(res, urlPath)
            logging.info(`    L response page (POST)`)
        }
    } else {
        // When pages no found
        res.writeHead(404, { 'Content-Type': 'text/html' })
        pages.addEndToResponse(res, '/no-found')
        logging.info(`    L response no-found`)
    }
}
