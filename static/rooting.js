module.exports = [
    {
        class: 'HomePage',
        elements: [
            {
                urlPath: '/',
                ja: {
                    title: 'Home',
                    description: 'キミの知らない世界を見せよう'
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
        elements: [
            {
                urlPath: '/no-found',
                ja: { title: 'No Found' },
                invisible: true
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
                    description: 'みんなの掲示板です。どなたでもご自由に書き込んでください'
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
        needToBeShared: true,
        elements: [
            {
                urlPath: '/world/democracy',
                ja: {
                    title: '「民主主義 (民主制)」は正しいのか？',
                    description: '投票制度の盲点と、その改良のための 3つの提案',
                    isNew: true
                }
            },
            {
                urlPath: '/world/mental-illness',
                ja: {
                    title: '精神病は実在するか？',
                    description: '製薬業界の 4つの矛盾から見えてくる「うつ病」や「統合失調症」の真の姿について',
                    letter: '住人への手紙 2通目',
                    isNew: true
                }
            },
            {
                urlPath: '/world/free-will',
                ja: {
                    title: '「自由意志」なんて存在しないと思うあなたへ',
                    description: '「量子力学」の見地から我々が自由であることを証明しよう'
                // },
                // en: {
                //     title: 'Does "Free Will" exist?',
                //     description: 'let's prove that we are completely free by quantum physics'
                }
            },
            {
                urlPath: '/world/feminism',
                ja: {
                    title: '「自称フェミニスト」の叩き潰し方',
                    description: 'フェミニストが嫌いな男性向けのフェミニズム入門'
                },
                en: {
                    title: 'How to beat up "self-proclaimed" feminists',
                    description: 'an introduction to feminism for men who think "feminism is horsecrap"',
                    isNew: true
                }
            },
            {
                urlPath: '/world/death-for-life',
                ja: {
                    title: '幸せに生きるには「死ぬ覚悟」が必要である、というお話',
                    description: '認知症のおばあちゃんとの会話より'
                },
                en: {
                    title: 'You need to be prepared to die for happiness',
                    description: 'from a conversation with my grandma with dementia',
                    isNew: true
                }
            },
            {
                urlPath: '/world/how-to-fail',
                ja: {
                    title: '人生で失敗する方法',
                    description: '「失敗」するために生きている多くの人々へ'
                },
                en: {
                    title: 'How to fail in your life',
                    description: 'to those of you who are striving to fail'
                }
            },
            {
                urlPath: '/world/nation',
                ja: {
                    title: 'もう人間は働かなくてもいい、という主張',
                    description: 'ベーシックインカムと「理想の国家」'
                }
            },
            {
                urlPath: '/world/reward',
                ja: {
                    title: '「できる人」には報酬を与えるべきか？',
                    description: '「成果主義」の落とし穴'
                }
            },
            {
                urlPath: '/world/ideal-way-to-live-life',
                ja: {
                    title: '「一番」を目指してはいけない',
                    description: 'あなたが目指すべきものについて'
                },
                en: {
                    title: 'Don\'t aim for becoming "number one"',
                    description: 'what should we really go after?'
                }
            },
            {
                urlPath: '/world/philosophy',
                ja: {
                    title: '哲学は無意味である',
                    description: '「この世界はどうして存在するのだろう？」私が答えましょう'
                }
            },
            {
                urlPath: '/world/education',
                ja: {
                    title: '我々が本当に学ぶべきことは何だろうか？',
                    description: '「歴史」から探る理想の教育'
                },
                en: {
                    title: 'What should we learn?',
                    description: 'about the ideal education from the viewpoint of history'
                }
            },
            {
                urlPath: '/world/grown-up',
                ja: {
                    title: 'あなたは本当に「大人」ですか？',
                    description: '我々が人間として生きるために'
                },
                en: {
                    title: 'Are you really an "adult"?',
                    description: 'about the conditions we need to live as human beings'
                }
            },
            {
                urlPath: '/world/freedom',
                ja: {
                    title: '自由に生きてはいけない',
                    description: '「自由」の本当の形について'
                },
                en: {
                    title: 'You should never live freely',
                    description: 'real "freedom" 99% of you don\'t understand'
                }
            },
            {
                urlPath: '/world/tips-for-your-life',
                ja: {
                    title: '今を生きるためのちょっとしたヒント',
                    description: '気をつけないと忘れてしまうこと、でもとっても大切なこと'
                // },
                // en: {
                //     title: 'Tips for living better life',
                //     description: 'important things we tend to forget',
                //     isNew: true
                }
            },
            {
                urlPath: '/world/happiness',
                ja: {
                    title: '「幸せ」の定義を科学しよう',
                    description: 'あなたの「幸せ」はどんな形ですか？'
                },
                en: {
                    title: 'What is the definition of happiness?',
                    description: 'taking scientific approach to happiness'
                }
            },
            {
                urlPath: '/world/your-goal',
                ja: {
                    title: '「幸せ」を目指してはいけない',
                    description: 'あなたが見落としている「幸せ」よりも大切なものについて'
                },
                en: {
                    title: 'Don\'t aim for "happiness"',
                    description: 'what is more important than "happiness" for your life'
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
                    description: '[1話 完結] 一通の謎の手紙、拾ったのはあなた'
                }
            },
            {
                urlPath: '/story/mystery/nightmare',
                ja: {
                    title: 'ナイトメア',
                    description: '[1話 完結] 遊園地が舞台のちょっと怖いお話'
                }
            },
            {
                urlPath: '/story/science-fiction/over-the-superposition',
                ja: {
                    title: '量子の導き',
                    description: '[全5話] そう遠くない未来、言語がひとつに統一された頃のお話'
                },
                numOfChapters: 5
            },
            {
                urlPath: '/story/comedy/baby-s-suffering',
                ja: {
                    title: '稚児の苦悩',
                    description: '[全2話] 私は赤ちゃんである'
                },
                numOfChapters: 2
            },
            {
                urlPath: '/story/comedy/one-man',
                ja: {
                    title: 'ひとり',
                    description: '[全3話] 彗星の日に起こる不思議な出来事'
                },
                numOfChapters: 3
            },
            {
                urlPath: '/story/mystery/the-dark-and-cold-place',
                ja: {
                    title: '暗くて寒い場所',
                    description: '[1話 完結] 部屋の明かりが消せないある女性のお話'
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
                    description: 'Fully Hatterの人生を変えた本をご紹介'
                }
            },
            {
                urlPath: '/bookshelf/movies',
                ja: {
                    title: 'Fully Hatter の本棚',
                    description: 'Fully Hatterのお気に入りの映画をご紹介'
                }
            },
            {
                urlPath: '/bookshelf/comics',
                ja: {
                    title: 'Fully Hatter の本棚',
                    description: 'Fully Hatterが愛したマンガをご紹介'
                }
            },
            {
                urlPath: '/bookshelf/ted',
                ja: {
                    title: 'Fully Hatter の本棚',
                    description: 'Fully Hatterに衝撃を与えたTED TALKをご紹介'
                }
            },
            {
                urlPath: '/bookshelf/links',
                ja: {
                    title: 'Fully Hatter の本棚',
                    description: 'Fully Hatterが感動したウェブサイトをご紹介'
                }
            }
        ]
    },
    {
        class: 'CSSPage',
        elements: [
            {
                urlPath: '/css/styles-home.css',
                filePath: './static/scss/styles-home.scss',
                ja: true
            },
            {
                urlPath: '/css/styles-others.css',
                filePath: './static/scss/styles-others.scss',
                ja: true
            }
        ]
    },
    {
        class: 'ContentPage',
        filePathPrefix: './static',
        elements: [
            {
                urlPath: '/images/world/mental-illness_IQ-distribution.png',
                ja: true
            },
            {
                urlPath: '/images/background-image.jpg',
                ja: true
            },
            {
                urlPath: '/images/background-image-og.jpg',
                ja: true
            },
            {
                urlPath: '/images/icons/favicon_192x192.png',
                ja: true
            },
            {
                urlPath: '/images/icons/person.png',
                ja: true
            },
            {
                urlPath: '/images/story/science-fiction/dear-you.jpg',
                ja: true
            },
            {
                urlPath: '/images/story/science-fiction/over-the-superposition.jpg',
                ja: true
            },
            {
                urlPath: '/images/story/mystery/nightmare.jpg',
                ja: true
            },
            {
                urlPath: '/images/story/mystery/the-dark-and-cold-place.jpg',
                ja: true
            },
            {
                urlPath: '/images/story/comedy/baby-s-suffering.jpg',
                ja: true
            },
            {
                urlPath: '/images/story/comedy/one-man.jpg',
                ja: true
            },
            {
                urlPath: '/js/client.js',
                ja: true
            }
        ]
    }
]
