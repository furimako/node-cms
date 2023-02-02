const fs = require('fs')
const sass = require('sass')
const BasePage = require('./base_page')

module.exports = class CSSPage extends BasePage {
    constructor({ lan, element }) {
        const scss = fs.readFileSync(element.filePath, 'utf8')
        const { css } = sass.renderSync({ data: scss })
        super({ lan, element, contentType: 'text/css' })
        this.content = css
    }

    async get() {
        return this.content
    }
}
