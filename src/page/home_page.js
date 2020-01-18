const fs = require('fs')
const mustache = require('mustache')
const { JST } = require('node-utils')
const BasePage = require('./base_page')
const rooting = require('../../static/rooting')
const mongodbDriver = require('../mongodb_driver')

const template = fs.readFileSync('./static/template/template.mustache', 'utf8')
const homeTemplate = fs.readFileSync('./static/template/home.mustache', 'utf8')
const likeJA = 'いいね！'
const commentJA = 'コメント'

module.exports = class HomePage extends BasePage {
    constructor({ element }) {
        super({ urlPath: element.urlPath, contentType: 'text/html' })
        this.element = element
        this.viewHome = {
            world: [],
            story: []
        }
        this._initializeViewHome()
    }
    
    _initializeViewHome() {
        rooting.forEach((v) => {
            v.elements.forEach((e) => {
                if (v.styleInHome) {
                    this.viewHome[v.styleInHome].push({
                        urlPath: (e.numOfChapters) ? `${e.urlPath}-1` : e.urlPath,
                        picturePath: `/images${e.urlPath}.jpg`,
                        title: e.title,
                        description: e.description,
                        newTag: (e.isNew) ? '<span class="tag is-danger">New!</span>' : ''
                    })
                }
            })
        })
    }

    async get(lan, pageNum) {
        let title
        let description
        if (lan === 'ja') {
            title = this.element.title
            description = this.element.description
        } else if (lan === 'en') {
            title = this.element.en.title
            description = this.element.en.description
        }
        
        const lanObj = { [lan]: true }
        this.setView({
            urlPath: this.element.urlPath,
            title,
            description,
            cssPath: '/css/styles-home.css',
            lan: lanObj
        })
        
        const summary = await mongodbDriver.findCountsForHome()
        const comments = await mongodbDriver.findComments({ name: { $ne: 'Fully Hatter' } })
        this._updateViewHome(pageNum, summary, comments, lan)
        
        this.view.bodyHTML = mustache.render(homeTemplate, this.viewHome)
        return mustache.render(template, this.view)
    }
    
    _updateViewHome(pageNum, summary, comments, lan) {
        this.viewHome.lan = { [lan]: true }
        for (let i = 0; i < this.viewHome.world.length; i += 1) {
            const likeCount = summary.likeCount[this.viewHome.world[i].urlPath] || 0
            const commentCount = summary.commentCount[this.viewHome.world[i].urlPath] || 0
            this.viewHome.world[i].like = `${likeJA} ${likeCount}`
            this.viewHome.world[i].comment = `${commentJA} ${commentCount}`
            
            if (i === 0) {
                this.viewHome.world[i].headHTML = '<div class="column">'
            }
            if (i === Math.floor((this.viewHome.world.length - 1) / 2)) {
                this.viewHome.world[i].footHTML = '</div>'
                this.viewHome.world[i].footHTML += '<div class="column">'
            }
            if (i === this.viewHome.world.length - 1) {
                this.viewHome.world[i].footHTML = '</div>'
            }
        }
        
        for (let i = 0; i < this.viewHome.story.length; i += 1) {
            const likeCount = summary.likeCount[this.viewHome.story[i].urlPath] || 0
            this.viewHome.story[i].like = `${likeJA} ${likeCount}`
            
            if (i === 0) {
                this.viewHome.story[i].headHTML = '<div class="column">'
            }
            if (i === Math.floor((this.viewHome.story.length - 1) / 2)) {
                this.viewHome.story[i].footHTML = '</div>'
                this.viewHome.story[i].footHTML += '<div class="column">'
            }
            if (i === this.viewHome.story.length - 1) {
                this.viewHome.story[i].footHTML = '</div>'
            }
        }
        
        // create comment list
        const pageTotal = Math.ceil(comments.length / 5)
        this.viewHome.commentListPagination = {
            pageNum,
            pageTotal,
            previousPageNum: pageNum - 1,
            disabledPrevious: (pageNum === 1) ? 'disabled' : '',
            nextPageNum: pageNum + 1,
            disabledNext: (pageNum === pageTotal) ? 'disabled' : ''
        }
        
        // from latest to oldest
        comments.sort((obj1, obj2) => obj2.date.getTime() - obj1.date.getTime())
        
        const commentListView = []
        comments.slice(pageNum * 5 - 5, pageNum * 5).forEach((commentObj) => {
            const viewObj = this.viewHome.world.find((e) => e.urlPath === commentObj.urlPath)
            const commentStr = mustache.render('{{raw}}', { raw: commentObj.comment }).replace(/(\r\n|\n|\r)/gm, ' ')
            
            let urlPath
            let pageTitle
            if (lan === 'ja') {
                urlPath = commentObj.urlPath
                pageTitle = (viewObj) ? viewObj.title : '掲示板'
            } else if (lan === 'en') {
                urlPath = `/en${commentObj.urlPath}`
                pageTitle = (viewObj) ? viewObj.title : 'Board'
            }
            commentListView.push({
                date: JST.convertToDate(commentObj.date),
                urlPath,
                pageTitle,
                name: commentObj.name,
                excerptOfComment: (commentStr.length > 30) ? `${commentStr.slice(0, 30)}...` : commentStr
            })
        })
        this.viewHome.comments = commentListView
    }
}
