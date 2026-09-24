const fs = require('fs')
const sass = require('sass')
const BasePage = require('./base_page')

// Bulma 0.9.4 (@import, global functions) and renderSync are deprecated in Dart Sass
// and fill logs/app-err.log with warnings on every start-up
const silenceDeprecations = ['legacy-js-api', 'import', 'global-builtin', 'color-functions']

module.exports = class CSSPage extends BasePage {
    constructor({ lan, element }) {
        const scss = fs.readFileSync(element.filePath, 'utf8')
        const { css } = sass.renderSync({ data: scss, silenceDeprecations })
        super({ lan, element, contentType: 'text/css' })
        this.content = css
    }

    async get() {
        return this.content
    }
}
