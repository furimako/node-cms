const http = require('http')
const fs = require('fs')
const url = require('url')
const marked = require('marked')
const mustache = require('mustache')

marked.setOptions({
  breaks: true
})

// definition


// read file
const index_mustache = fs.readFileSync('./static/index.mustache', 'utf8')
const no_found_html = fs.readFileSync('./static/no-found.html', 'utf8')

// render HTML
const index_html = createHTML('Home', './static/markdown/index.md')
const your_goal_html = createHTML('「幸せ」を目指してはいけない', './static/markdown/ideology/your-goal.md')
const happiness_html = createHTML('あなたにとっての「幸せ」は？', './static/markdown/ideology/happiness.md')
const tips_for_your_life_html = createHTML('今を生きるためのちょっとしたヒント', './static/markdown/ideology/tips-for-your-life.md')
const freedom_html = createHTML('「自由」に生きてはいけない', './static/markdown/ideology/freedom.md')
const grown_up_html = createHTML('「大人」について', './static/markdown/ideology/grown-up.md')
const education_html = createHTML('理想の「教育」', './static/markdown/ideology/education.md')
const philosophy_html = createHTML('「哲学」は無意味である (仮)', './static/markdown/ideology/philosophy.md')
const ideal_way_to_live_life_html = createHTML('「一番」を目指してはいけない', './static/markdown/ideology/ideal-way-to-live-life.md')

// Start Server
let server = http.createServer(requestListenerFunction)
server.listen(8128)
console.log('Server Start')


function createHTML(title, filePath) {
    let markdown = fs.readFileSync(filePath, 'utf8')
    let html = marked(markdown)
    return mustache.render(index_mustache, {"title": title, "body": html})
}


function requestListenerFunction(request, response) {
    response.writeHead(200, {'Content-Type': 'text/html'})
    
    switch (url.parse(request.url).pathname) {
        case "/":
            response.write(index_html)
            break
        case "/ideology/your-goal":
            response.write(your_goal_html)
            break
        case "/ideology/happiness":
            response.write(happiness_html)
            break
        case "/ideology/tips-for-your-life":
            response.write(tips_for_your_life_html)
            break
        case "/ideology/freedom":
            response.write(freedom_html)
            break
        case "/ideology/grown-up":
            response.write(grown_up_html)
            break
        case "/ideology/education":
            response.write(education_html)
            break
        case "/ideology/philosophy":
            response.write(philosophy_html)
            break
        case "/ideology/ideal-way-to-live-life":
            response.write(ideal_way_to_live_life_html)
            break
        default:
            response.write(no_found_html)
            break
    }
    response.end()
}
