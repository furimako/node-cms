
module.exports = [
    {
        class: 'HomePage',
        elements: [
            {
                urlPath: '/',
                title: 'Home',
                description: 'キミの知らない世界を見せよう。'
            }
        ]
    },
    {
        class: 'MarkdownPage',
        filePathPrefix: './static/contents',
        filePathSuffix: '.md',
        hasCommentsField: true,
        elements: [
            {
                urlPath: '/board',
                title: '掲示板',
                description: 'みんなの掲示板です。どなたでもご自由に書き込んでください。'
            }
        ]
    },
    {
        class: 'MarkdownPage',
        filePathPrefix: './static/contents',
        filePathSuffix: '.md',
        hasLikeButton: true,
        hasCommentsField: true,
        styleInHome: 'world',
        elements: [
            {
                urlPath: '/world/death-for-life',
                title: '幸せに生きるために',
                description: '幸せに生きるには「死ぬ覚悟」が必要なのではないか、というお話',
                isNew: true
            },
            {
                urlPath: '/world/how-to-fail',
                title: '人生で「失敗」するには',
                description: '「失敗」するために生きている多くの人々へ'
            },
            {
                urlPath: '/world/nation',
                title: '理想の国家',
                description: 'ベーシックインカムで世界中の誰もが「本当にやりたいこと」のできる世界へ'
            },
            {
                urlPath: '/world/reward',
                title: '成果主義について',
                description: 'できる人にはお金を与えるべき？ いいチームを作るためにあなたが知るべき３つのポイント'
            },
            {
                urlPath: '/world/ideal-way-to-live-life',
                title: '一番を目指してはいけない',
                description: '一番を目指さずに何を目指すべきだというのか！そんなあなたのためのページです'
            },
            {
                urlPath: '/world/philosophy',
                title: '哲学は無意味である (仮)',
                description: '「この世界はどうして存在するのだろう？」私が答えましょう'
            },
            {
                urlPath: '/world/education',
                title: '理想の教育',
                description: '「歴史のテスト」を憎むすべての人へ'
            },
            {
                urlPath: '/world/grown-up',
                title: '「大人」について',
                description: 'あなたは本当に「大人」ですか？ 我々が国家から自由になるために'
            },
            {
                urlPath: '/world/freedom',
                title: '自由に生きてはいけない',
                description: '99%の人が勘違いしている「自由」の本当の姿について'
            },
            {
                urlPath: '/world/tips-for-your-life',
                title: '今を生きるためのちょっとしたヒント',
                description: '気をつけないと忘れてしまうこと。でもとっても大切なこと'
            },
            {
                urlPath: '/world/happiness',
                title: 'あなたにとっての「幸せ」は？',
                description: '「幸せ」の定義を科学しよう'
            },
            {
                urlPath: '/world/your-goal',
                title: '「幸せ」を目指してはいけない',
                description: '「幸せ」になるために生きているすべての人へ'
            }
        ]
    },
    {
        class: 'MarkdownPage',
        filePathPrefix: './static/contents',
        filePathSuffix: '.md',
        hasLikeButton: true,
        styleInHome: 'story',
        elements: [
            {
                urlPath: '/story/science-fiction/dear-you',
                title: '自由なキミへ',
                description: '[1話 完結] 一通の謎の手紙。拾ったのはあなた。'
            },
            {
                urlPath: '/story/mystery/nightmare',
                title: 'ナイトメア',
                description: '[1話 完結] 遊園地が舞台のちょっと怖いお話。'
            },
            {
                urlPath: '/story/science-fiction/over-the-superposition',
                title: '量子の導き',
                description: '[全5話] そう遠くない未来、言語がひとつに統一された頃のお話。',
                numOfChapters: 5
            },
            {
                urlPath: '/story/comedy/baby-s-suffering',
                title: '稚児の苦悩',
                description: '[全2話] 私は赤ちゃんである。',
                numOfChapters: 2
            },
            {
                urlPath: '/story/comedy/one-man',
                title: 'ひとり',
                description: '[全3話] 彗星の日に起こる不思議な出来事。',
                numOfChapters: 3
            },
            {
                urlPath: '/story/mystery/the-dark-and-cold-place',
                title: '暗くて寒い場所',
                description: '[1話 完結] 部屋の明かりが消せないある女性のお話。'
            }
        ]
    },
    {
        class: 'HTMLPage',
        filePathPrefix: './static/contents',
        filePathSuffix: '.html',
        elements: [
            {
                urlPath: '/about',
                title: 'About',
                description: 'このサイトについて。Fully Hatter について。'
            },
            {
                urlPath: '/bookshelf/books',
                title: 'Fully Hatter の本棚',
                description: 'Fully Hatterの人生を変えた本をご紹介。'
            },
            {
                urlPath: '/bookshelf/movies',
                title: 'Fully Hatter の本棚',
                description: 'Fully Hatterのお気に入りの映画をご紹介。'
            },
            {
                urlPath: '/bookshelf/comics',
                title: 'Fully Hatter の本棚',
                description: 'Fully Hatterが愛したマンガをご紹介。'
            },
            {
                urlPath: '/bookshelf/ted',
                title: 'Fully Hatter の本棚',
                description: 'Fully Hatterに衝撃を与えたTED TALKをご紹介。'
            },
            {
                urlPath: '/bookshelf/links',
                title: 'Fully Hatter の本棚',
                description: 'Fully Hatterが感動したウェブサイトをご紹介。'
            },
            {
                urlPath: '/no-found',
                title: 'No Found'
            }
        ]
    },
    {
        class: 'CSSPage',
        elements: [
            {
                urlPath: '/css/styles-home.css',
                filePath: './static/scss/styles-home.scss'
            },
            {
                urlPath: '/css/styles-others.css',
                filePath: './static/scss/styles-others.scss'
            }
        ]
    },
    {
        class: 'ImagePage',
        filePathPrefix: './static',
        elements: [
            { urlPath: '/images/background-image.jpg' },
            { urlPath: '/images/background-image-og.jpg' },
            { urlPath: '/images/icons/favicon_192x192.png' },
            { urlPath: '/images/icons/person.png' },
            { urlPath: '/images/story/science-fiction/dear-you.jpg' },
            { urlPath: '/images/story/science-fiction/over-the-superposition.jpg' },
            { urlPath: '/images/story/mystery/nightmare.jpg' },
            { urlPath: '/images/story/mystery/the-dark-and-cold-place.jpg' },
            { urlPath: '/images/story/comedy/baby-s-suffering.jpg' },
            { urlPath: '/images/story/comedy/one-man.jpg' }
        ]
    }
]
