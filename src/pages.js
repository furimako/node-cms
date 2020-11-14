const HomePage = require('./page/home_page')
const MarkdownPage = require('./page/markdown_page')
const HTMLPage = require('./page/html_page')
const CSSPage = require('./page/css_page')
const ContentPage = require('./page/content_page')
const rooting = require('../static/rooting')

module.exports = class Pages {
    constructor() {
        this.pages = new Map()
        this._setPages()
    }
    
    has(urlPath) {
        return this.pages.has(urlPath)
    }
    
    async get(urlPath, options = {}) {
        return this.pages.get(urlPath).get(options)
    }

    contentType(urlPath) {
        return this.pages.get(urlPath).contentType
    }
    
    _setPages() {
        rooting.forEach((v) => {
            v.elements.forEach((e) => {
                let jaPageObj
                let enPageObj
                let page
                const isMultilingual = e.ja && e.en
                if (e.ja) {
                    jaPageObj = {
                        lan: 'ja',
                        isMultilingual,
                        element: e,
                        filePath: `${v.filePathPrefix}${e.urlPath}${v.filePathSuffix || ''}`,
                        titleWithDescription: v.styleInHome === 'world',
                        hasLikeButton: v.hasLikeButton,
                        hasCommentsField: v.hasCommentsField,
                        hasRelatedPages: v.hasRelatedPages,
                        needToBeShared: v.needToBeShared
                    }
                    if (e.numOfChapters) {
                        for (let i = 1; i <= e.numOfChapters; i += 1) {
                            jaPageObj.filePath = `${v.filePathPrefix}${e.urlPath}-${i}${v.filePathSuffix}`
                            jaPageObj.chapter = i
                            page = _getPage(v.class, jaPageObj)
                            this.pages.set(`${e.urlPath}-${i}`, page)
                        }
                        return
                    }
                    page = _getPage(v.class, jaPageObj)
                    this.pages.set(e.urlPath, page)
                }
                if (e.en) {
                    enPageObj = {
                        lan: 'en',
                        isMultilingual,
                        element: e,
                        filePath: `${v.filePathPrefix}-en${e.urlPath}${v.filePathSuffix || ''}`,
                        titleWithDescription: v.styleInHome === 'world',
                        hasLikeButton: v.hasLikeButton,
                        hasCommentsField: v.hasCommentsField,
                        hasRelatedPages: v.hasRelatedPages,
                        needToBeShared: v.needToBeShared
                    }
                    if (e.numOfChapters) {
                        for (let i = 1; i <= e.numOfChapters; i += 1) {
                            enPageObj.filePath = `${v.filePathPrefix}-en${e.urlPath}-${i}${v.filePathSuffix}`
                            enPageObj.chapter = i
                            page = _getPage(v.class, enPageObj)
                            this.pages.set(`/en${e.urlPath}-${i}`, page)
                        }
                        return
                    }
                    page = _getPage(v.class, enPageObj)
                    this.pages.set(`/en${e.urlPath}`, page)
                }
            })
        })
    }
}

function _getPage(className, pageObj) {
    switch (className) {
    case 'HomePage':
        return new HomePage(pageObj)
    case 'MarkdownPage':
        return new MarkdownPage(pageObj)
    case 'HTMLPage':
        return new HTMLPage(pageObj)
    case 'CSSPage':
        return new CSSPage(pageObj)
    case 'ContentPage':
        return new ContentPage(pageObj)
    default:
        throw new Error(`rooting.js should be wrong (class: ${className})`)
    }
}
