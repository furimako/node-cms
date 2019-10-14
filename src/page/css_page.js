const fs = require('fs')
const sass = require('node-sass')
const BasePage = require('./base_page')

module.exports = class CSSPage extends BasePage {
    constructor({ element, filePath }) {
        const scss = fs.readFileSync(filePath, 'utf8')
        const { css } = sass.renderSync({ data: scss })
        super({ urlPath: element.urlPath, contentType: 'text/css', content: css })
    }
}
