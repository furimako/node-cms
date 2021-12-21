const fs = require('fs')
const mustache = require('mustache')
const { logging, JST } = require('node-utils')
const BasePage = require('./base_page')
const rooting = require('../../static/rooting')
const pickedUpComments = require('../../static/picked-up-comments')
const mongodbDriver = require('../mongodb_driver')

const template = fs.readFileSync('./static/template/template.mustache', 'utf8')
const homeTemplate = fs.readFileSync('./static/template/home.mustache', 'utf8')
const commentLength = 40

module.exports = class HomePage extends BasePage {
    constructor({ lan, isMultilingual, element }) {
        super({
            lan,
            element,
            urlPath: element.urlPath,
            contentType: 'text/html'
        })
        this.setView({
            cssPath: '/css/styles-home.css',
            isMultilingual
        })
    }
    
    async get(options) {
        logging.info(`    L lan: ${this.lan}, options: ${JSON.stringify(options)}`)
        const {
            pageNum, registration, email, messageSent
        } = options
        
        const numOfResidents = await mongodbDriver.count('registrations', { residentStatus: 'REGISTERED' })

        await this._updateViewHome(pageNum, registration, email, messageSent, numOfResidents)
        this.view.bodyHTML = mustache.render(homeTemplate, this.viewHome, this.partial)
        this.view.numOfResidents = numOfResidents
        this.view.isDuplicatePage = (pageNum !== 1)
        return mustache.render(template, this.view, this.partial)
    }
    
    async _updateViewHome(pageNum, registration, email, messageSent, numOfResidents) {
        this.viewHome = {
            world: [],
            column: [],
            story: []
        }
        this.viewHome.lan = { [this.lan]: true }
        this.viewHome.registration = registration
        this.viewHome.email = email
        this.viewHome.messageSent = messageSent
        this.viewHome.registerFormHome = { registerFormId: 'registerHome' }
        this.viewHome.numOfResidents = numOfResidents

        rooting.forEach((v) => {
            v.elements.forEach((e) => {
                if (v.styleInHome && e[this.lan] && !e[this.lan].hidden) {
                    this.viewHome[v.styleInHome].push({
                        urlPath: (e.numOfChapters) ? `${e.urlPath}-1` : e.urlPath,
                        picturePath: `/images${e.urlPath}.jpg`,
                        title: e[this.lan].title,
                        description: e[this.lan].description,
                        titleTag: e[this.lan].titleTag
                    })
                }
            })
        })
        
        const summary = await mongodbDriver.findCountsForHome(this.lan)

        // update viewHome for World
        for (let i = 0; i < this.viewHome.world.length; i += 1) {
            const likeCount = summary.likeCount[this.viewHome.world[i].urlPath] || 0
            const commentCount = summary.commentCount[this.viewHome.world[i].urlPath] || 0
            this.viewHome.world[i].numOfLikes = `${likeCount}`
            this.viewHome.world[i].numOfComments = `${commentCount}`
            
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

        // update viewHome for Column
        for (let i = 0; i < this.viewHome.column.length; i += 1) {
            const likeCount = summary.likeCount[this.viewHome.column[i].urlPath] || 0
            const commentCount = summary.commentCount[this.viewHome.column[i].urlPath] || 0
            this.viewHome.column[i].numOfLikes = `${likeCount}`
            this.viewHome.column[i].numOfComments = `${commentCount}`
            
            if (i === 0) {
                this.viewHome.column[i].headHTML = '<div class="column">'
            }
            if (i === Math.floor((this.viewHome.column.length - 1) / 2)) {
                this.viewHome.column[i].footHTML = '</div>'
                this.viewHome.column[i].footHTML += '<div class="column">'
            }
            if (i === this.viewHome.column.length - 1) {
                this.viewHome.column[i].footHTML = '</div>'
            }
        }
        
        // update viewHome for Story
        for (let i = 0; i < this.viewHome.story.length; i += 1) {
            const likeCount = summary.likeCount[this.viewHome.story[i].urlPath] || 0
            this.viewHome.story[i].numOfLikes = `${likeCount}`
            
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

        // update viewHome for Picked Up Comments
        if (pickedUpComments[this.lan]) {
            this.viewHome.pickedUpComments = { commentsList: [] }
            for (let i = 0; i < pickedUpComments[this.lan].length; i += 1) {
                const commentObj = pickedUpComments[this.lan][i]

                this.viewHome.pickedUpComments.commentsList.push({
                    title: commentObj.title,
                    urlPath: commentObj.urlPath,
                    description: _getTitle(commentObj.urlPath, this.lan),
                    commentNumber: commentObj.commentNumber
                })

                if (i === 0) {
                    this.viewHome.pickedUpComments.commentsList[i].headHTML = '<div class="column">'
                }
                if (i === Math.floor((pickedUpComments[this.lan].length - 1) / 2)) {
                    this.viewHome.pickedUpComments.commentsList[i].footHTML = '</div>'
                    this.viewHome.pickedUpComments.commentsList[i].footHTML += '<div class="column">'
                }
                if (i === pickedUpComments[this.lan].length - 1) {
                    this.viewHome.pickedUpComments.commentsList[i].footHTML = '</div>'
                }
            }
        }

        // update viewHome for recent comments
        const comments = await mongodbDriver.find(
            'comments',
            { urlPath: { $ne: '/temp' }, lan: this.lan }
        )
        const commentListSize = 6
        const pageTotal = Math.ceil(comments.length / commentListSize)
        let pageNumValidated
        
        if (pageTotal === 0) {
            pageNumValidated = 0
        } else if (pageNum >= 1 && pageNum <= pageTotal) {
            pageNumValidated = pageNum
        } else {
            pageNumValidated = 1
        }
        
        this.viewHome.commentListPagination = {
            pageNum: pageNumValidated,
            pageTotal,
            previousPageNum: (pageNumValidated <= 2) ? false : pageNumValidated - 1,
            disabledPrevious: (pageNumValidated <= 1) ? 'disabled' : '',
            nextPageNum: (pageNumValidated >= pageTotal) ? pageTotal : pageNumValidated + 1,
            disabledNext: (pageNumValidated >= pageTotal) ? 'disabled' : ''
        }
        this.viewHome.comments = await this._getCommentListView(
            comments,
            commentListSize,
            pageNumValidated
        )
    }

    async _getCommentListView(comments, commentListSize, pageNumValidated) {
        // from latest to oldest
        comments.sort((obj1, obj2) => obj2.date.getTime() - obj1.date.getTime())
        
        const commentListView = []
        comments
            .slice(
                pageNumValidated * commentListSize - commentListSize,
                pageNumValidated * commentListSize
            )
            .forEach((commentObj) => {
                let viewObj = this.viewHome.world.find((e) => e.urlPath === commentObj.urlPath)
                if (!viewObj) {
                    viewObj = this.viewHome.column.find((e) => e.urlPath === commentObj.urlPath)
                }
                const commentStr = mustache.render('{{raw}}', { raw: commentObj.comment }).replace(/(\r\n|\n|\r)/gm, ' ')
            
                let urlPath
                let pageTitle
                if (this.lan === 'ja') {
                    urlPath = commentObj.urlPath
                    pageTitle = (viewObj) ? viewObj.title : '掲示板'
                } else if (this.lan === 'en') {
                    urlPath = `/en${commentObj.urlPath}`
                    pageTitle = (viewObj) ? viewObj.title : 'Board'
                }
                commentListView.push({
                    date: JST.convertToDateStr(commentObj.date),
                    urlPath,
                    pageTitle,
                    name: commentObj.name,
                    excerptOfComment: (commentStr.length > commentLength) ? `${commentStr.slice(0, commentLength)}...` : commentStr
                })
            })
        return commentListView
    }
}

function _getTitle(urlPath, lan) {
    let title = ''
    rooting.forEach((v) => {
        v.elements.forEach((e) => {
            if (urlPath === e.urlPath) {
                title = e[lan].title
            }
        })
    })
    return title
}
