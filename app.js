const fs = require('fs')
const http = require('http')
const parse = require('url').parse
const qs = require('querystring')
const logging = require('./server/logging')
const mailer = require('./server/mailer')
const Pages = require('./server/pages')
const mongodbDriver = require('./server/mongodb_driver')
let pages = new Pages()

const json = fs.readFileSync('./server/views/views.json', 'utf8')
const views = JSON.parse(json)
pages.add(views)

const json_images = fs.readFileSync('./server/views/views-images.json', 'utf8')
const views_images = JSON.parse(json_images)
pages.add(views_images)

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
