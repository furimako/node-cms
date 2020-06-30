
module.exports = [
    {
        class: 'HomePage',
        elements: [
            {
                urlPath: '/',
                ja: {
                    title: 'Home',
                    description: 'キミの知らない世界を見せよう。'
                },
                en: {
                    title: 'Home',
                    description: 'Show you the world you have not seen.'
                }
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
                ja: {
                    title: '掲示板',
                    description: 'みんなの掲示板です。どなたでもご自由に書き込んでください。'
                },
                en: {
                    title: 'Board',
                    description: 'The board is for all of you. You can send any messages here.'
                }
            }
        ]
    },
    {
        class: 'MarkdownPage',
        filePathPrefix: './static/contents',
        filePathSuffix: '.md',
        hasLikeButton: true,
        hasCommentsField: true,
        hasRelatedPages: true,
        styleInHome: 'world',
        elements: [
            {
                urlPath: '/world/feminism',
                ja: {
                    title: '「自称フェミニスト」の叩き潰し方',
                    description: '「フェミニズムなんてクソ喰らえ」だと思っている多くの男性へ',
                    isNew: true
                }
            },
            {
                urlPath: '/world/death-for-life',
                ja: {
                    title: '幸せに生きるために',
                    description: '幸せに生きるには「死ぬ覚悟」が必要なのではないか、というお話'
                }
            },
            {
                urlPath: '/world/how-to-fail',
                ja: {
                    title: '人生で「失敗」するには',
                    description: '「失敗」するために生きている多くの人々へ'
                }
            },
            {
                urlPath: '/world/nation',
                ja: {
                    title: '理想の国家',
                    description: 'ベーシックインカムで世界中の誰もが「本当にやりたいこと」のできる世界へ'
                }
            },
            {
                urlPath: '/world/reward',
                ja: {
                    title: '成果主義について',
                    description: 'できる人にはお金を与えるべき？ いいチームを作るためにあなたが知るべき３つのポイント'
                }
            },
            {
                urlPath: '/world/ideal-way-to-live-life',
                ja: {
                    title: '一番を目指してはいけない',
                    description: 'あなたが本当に目指すべきものについて'
                }
            },
            {
                urlPath: '/world/philosophy',
                ja: {
                    title: '哲学は無意味である (仮)',
                    description: '「この世界はどうして存在するのだろう？」私が答えましょう'
                }
            },
            {
                urlPath: '/world/education',
                ja: {
                    title: '理想の教育',
                    description: '「歴史のテスト」を憎むすべての人へ'
                }
            },
            {
                urlPath: '/world/grown-up',
                ja: {
                    title: '「大人」について',
                    description: 'あなたは本当に「大人」ですか？ 我々が国家から自由になるために'
                },
                en: {
                    title: 'On Adulthood',
                    description: 'Questioning What Makes You Fully Matured Grown-Up to Free Yourself From Your Nation'
                }
            },
            {
                urlPath: '/world/freedom',
                ja: {
                    title: '自由に生きてはいけない',
                    description: '99%の人が勘違いしている「自由」の本当の姿について'
                },
                en: {
                    title: 'You Should Never Live Freely',
                    description: 'Real "Freedom" 99% of People Misunderstand'
                }
            },
            {
                urlPath: '/world/tips-for-your-life',
                ja: {
                    title: '今を生きるためのちょっとしたヒント',
                    description: '気をつけないと忘れてしまうこと。でもとっても大切なこと'
                }
            },
            {
                urlPath: '/world/happiness',
                ja: {
                    title: 'あなたにとっての「幸せ」は？',
                    description: '「幸せ」の定義を科学しよう'
                },
                en: {
                    title: 'What is Hapiness for You?',
                    description: 'Taking Scientific Approach to Happiness',
                    isNew: true
                }
            },
            {
                urlPath: '/world/your-goal',
                ja: {
                    title: '「幸せ」を目指してはいけない',
                    description: 'あなたが見落としている「幸せ」よりも大切なものについて'
                },
                en: {
                    title: 'Don\'t aim for HAPPINESS',
                    description: 'The most important thing you should care about for your life'
                }
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
                ja: {
                    title: '自由なキミへ',
                    description: '[1話 完結] 一通の謎の手紙。拾ったのはあなた。'
                }
            },
            {
                urlPath: '/story/mystery/nightmare',
                ja: {
                    title: 'ナイトメア',
                    description: '[1話 完結] 遊園地が舞台のちょっと怖いお話。'
                }
            },
            {
                urlPath: '/story/science-fiction/over-the-superposition',
                ja: {
                    title: '量子の導き',
                    description: '[全5話] そう遠くない未来、言語がひとつに統一された頃のお話。'
                },
                numOfChapters: 5
            },
            {
                urlPath: '/story/comedy/baby-s-suffering',
                ja: {
                    title: '稚児の苦悩',
                    description: '[全2話] 私は赤ちゃんである。'
                },
                numOfChapters: 2
            },
            {
                urlPath: '/story/comedy/one-man',
                ja: {
                    title: 'ひとり',
                    description: '[全3話] 彗星の日に起こる不思議な出来事。'
                },
                numOfChapters: 3
            },
            {
                urlPath: '/story/mystery/the-dark-and-cold-place',
                ja: {
                    title: '暗くて寒い場所',
                    description: '[1話 完結] 部屋の明かりが消せないある女性のお話。'
                }
            }
        ]
    },
    {
        class: 'HTMLPage',
        filePathPrefix: './static/contents',
        filePathSuffix: '.html',
        elements: [
            {
                urlPath: '/bookshelf/books',
                ja: {
                    title: 'Fully Hatter の本棚',
                    description: 'Fully Hatterの人生を変えた本をご紹介。'
                }
            },
            {
                urlPath: '/bookshelf/movies',
                ja: {
                    title: 'Fully Hatter の本棚',
                    description: 'Fully Hatterのお気に入りの映画をご紹介。'
                }
            },
            {
                urlPath: '/bookshelf/comics',
                ja: {
                    title: 'Fully Hatter の本棚',
                    description: 'Fully Hatterが愛したマンガをご紹介。'
                }
            },
            {
                urlPath: '/bookshelf/ted',
                ja: {
                    title: 'Fully Hatter の本棚',
                    description: 'Fully Hatterに衝撃を与えたTED TALKをご紹介。'
                }
            },
            {
                urlPath: '/bookshelf/links',
                ja: {
                    title: 'Fully Hatter の本棚',
                    description: 'Fully Hatterが感動したウェブサイトをご紹介。'
                }
            },
            {
                urlPath: '/no-found',
                ja: { title: 'No Found' }
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
