
const http = require('http')
const Pages = require('./js/pages')

// Create pages
let pages = new Pages()
pages.addHTML(
    '/',
    'Home',
    'キミの知らない世界を見せよう。',
    './static/home.html'
)
pages.addHTML(
    false,
    'No Found',
    '',
    './static/no-found.html'
)
pages.addHTML(
    '/about',
    'About',
    'このサイトについて。Fully Hatter について。'
)

// World
pages.addHTML(
    '/world/your-goal',
    '「幸せ」を目指してはいけない',
    '多くの人は「幸せ」を求めて日々生きているのではないだろうか。'
)
pages.addHTML(
    '/world/happiness',
    'あなたにとっての「幸せ」は？',
    '「幸せ」の定義は何でしょうか？ あなたが気づいていない、「幸せ」の一つの姿について。'
)
pages.addHTML(
    '/world/tips-for-your-life',
    '今を生きるためのちょっとしたヒント',
    '私のメモ帳の中身。気をつけないと忘れてしまうこと。でもとっても大切なこと。'
)
pages.addHTML(
    '/world/freedom',
    '「自由」に生きてはいけない',
    'きっとキミは思うだろう。そんなはずはない！ と。でもいつかキミはこう思うだろう。確かにそうかもしれない、と。'
)
pages.addHTML(
    '/world/grown-up',
    '「大人」について',
    'あなたは本当に「大人」ですか？'
)
pages.addHTML(
    '/world/education',
    '理想の「教育」',
    '「歴史のテスト」を憎むすべての人に、このページを捧げます。'
)
pages.addHTML(
    '/world/philosophy',
    '「哲学」は無意味である (仮)',
    '「この世界はどうして存在するのだろう？」Fully Hatter が答えましょう。'
)
pages.addHTML(
    '/world/ideal-way-to-live-life',
    '「一番」を目指してはいけない',
    '「一番」を目指さずに、いったい何を目指すべきだというのか！ そんなあなたのためのページです。'
)

// Story
pages.addHTML(
    '/story/science-fiction/dear-you',
    '自由なキミへ',
    '一通の謎の手紙。拾ったのはあなた。[一話 完結]'
)
pages.addHTMLs(
    '/story/science-fiction/over-the-superposition',
    '量子の導き',
    '第一話。そう遠くない未来、言語がひとつに統一された頃のお話。[全五話]',
    '第二話。そう遠くない未来、言語がひとつに統一された頃のお話。[全五話]',
    '第三話。そう遠くない未来、言語がひとつに統一された頃のお話。[全五話]',
    '第四話。そう遠くない未来、言語がひとつに統一された頃のお話。[全五話]',
    '第五話。そう遠くない未来、言語がひとつに統一された頃のお話。[全五話]'
)
pages.addHTML(
    '/story/mystery/nightmare',
    'ナイトメア',
    '遊園地が舞台のちょっと怖いお話。[一話 完結]'
)
pages.addHTML(
    '/story/mystery/the-dark-and-cold-place',
    '暗くて寒い場所',
    '部屋の明かりが消せないある女性のお話。ホラー系が苦手な人は絶対に読まないで下さい。[一話 完結]'
)
pages.addHTMLs(
    '/story/comedy/baby-s-suffering',
    '稚児の苦悩',
    '第一話。私は赤ちゃんである。[全二話]',
    '第二話。私は赤ちゃんである。[全二話]'
)
pages.addHTMLs(
    '/story/comedy/one-man',
    'ひとり',
    '第一話。彗星の日に起こる不思議な出来事。[全三話]',
    '第二話。彗星の日に起こる不思議な出来事。[全三話]',
    '第三話。彗星の日に起こる不思議な出来事。[全三話]',
)

let elements = new Pages()
elements.addText('/node_modules/bulma/css/bulma.css')
elements.addBinary('/favicon.png')

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
