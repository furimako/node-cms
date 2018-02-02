
const http = require('http')
const Pages = require('./scripts/pages')

// Create pages
let pages = new Pages()
pages.addPage(
    'Home',
    'キミの知らない世界を見せよう。',
    '/',
    './static/index.html'
)
pages.addPage(
    'No Found',
    '',
    false,
    './static/no-found.html'
)
pages.addPage(
    '「幸せ」を目指してはいけない',
    '多くの人は「幸せ」を求めて日々生きているのではないだろうか。',
    '/ideology/your-goal'
)
pages.addPage(
    'あなたにとっての「幸せ」は？',
    '「幸せ」の定義は何でしょうか？ あなたが気づいていない、「幸せ」の一つの姿について。',
    '/ideology/happiness'
)
pages.addPage(
    '今を生きるためのちょっとしたヒント',
    '私のメモ帳の中身。気をつけないと忘れてしまうこと。でもとっても大切なこと。',
    '/ideology/tips-for-your-life'
)
pages.addPage(
    '「自由」に生きてはいけない',
    'きっとキミは思うだろう。そんなはずはない！ と。でもいつかキミはこう思うだろう。確かにそうかもしれない、と。',
    '/ideology/freedom'
)
pages.addPage(
    '「大人」について',
    'あなたは本当に「大人」ですか？',
    '/ideology/grown-up'
)
pages.addPage(
    '理想の「教育」',
    '「歴史のテスト」を憎むすべての人に、このページを捧げます。',
    '/ideology/education'
)
pages.addPage(
    '「哲学」は無意味である (仮)',
    '「この世界はどうして存在するのだろう？」Fully Hatter が答えましょう。',
    '/ideology/philosophy'
)
pages.addPage(
    '「一番」を目指してはいけない',
    '「一番」を目指さずに、いったい何を目指すべきだというのか！ そんなあなたのためのページです。',
    '/ideology/ideal-way-to-live-life'
)

let binaries = new Pages()
binaries.addBinary('/favicon.png')

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
        
    } else if (binaries.has(urlPath)) {
        response.writeHead(200, {'Content-Type' : binaries.contentType(urlPath)})
        response.end(binaries.get(urlPath))
        console.log(`response binary (path: ${urlPath})`)
        
    } else {
        response.writeHead(404, {'Content-Type' : 'text/html'})
        response.end(pages.get(false))
        console.log(`response no-found (path: ${urlPath})`)
    }
}
