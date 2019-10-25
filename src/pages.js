const HomePage = require('./page/home_page')
const MarkdownPage = require('./page/markdown_page')
const HTMLPage = require('./page/html_page')
const CSSPage = require('./page/css_page')
const ImagePage = require('./page/image_page')
const rooting = require('../static/rooting')

module.exports = class Pages {
    constructor() {
        this.pages = new Map()
        this._setPages()
    }

    has(urlPath) {
        return this.pages.has(urlPath)
    }

    async get(urlPath, numOfComments = 5) {
        return this.pages.get(urlPath).get(numOfComments)
    }

    contentType(urlPath) {
        return this.pages.get(urlPath).contentType
    }
    
    _setPages() {
        rooting.forEach((v) => {
            v.elements.forEach((e) => {
                if (e.numOfChapters) {
                    for (let i = 1; i <= e.numOfChapters; i += 1) {
                        const pageObj = {
                            element: e,
                            filePath: `${v.filePathPrefix + e.urlPath}-${i}${v.filePathSuffix}`,
                            titleWithDescription: v.titleWithDescription,
                            hasLikeButton: v.hasLikeButton,
                            hasCommentsField: v.hasCommentsField,
                            chapter: i
                        }
                        
                        const pageWithChapters = new MarkdownPage(pageObj)
                        this.pages.set(`${e.urlPath}-${i}`, pageWithChapters)
                    }
                    return
                }
                
                const filePath = v.filePathPrefix + e.urlPath + (v.filePathSuffix || '')
                const pageObj = {
                    element: e,
                    filePath: (e.filePath) ? e.filePath : filePath,
                    titleWithDescription: v.titleWithDescription,
                    hasLikeButton: v.hasLikeButton,
                    hasCommentsField: v.hasCommentsField
                }
                
                let page
                switch (v.class) {
                case 'HomePage':
                    page = new HomePage(pageObj)
                    break
                case 'MarkdownPage':
                    page = new MarkdownPage(pageObj)
                    break
                case 'HTMLPage':
                    page = new HTMLPage(pageObj)
                    break
                case 'CSSPage':
                    page = new CSSPage(pageObj)
                    break
                case 'ImagePage':
                    page = new ImagePage(pageObj)
                    break
                default:
                    throw new Error(`rooting.js should be wrong (class: ${v.class})`)
                }
                
                this.pages.set(e.urlPath, page)
            })
        })
    }
}
