import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import express from 'express'

const delay = ms => new Promise(res => setTimeout(res, ms))
const defaults = {
  staticPath: '/',
  route: '/',
  template: 'index.html',
  selector: '#root',
  replacement: '{{prerender}}',
  host: '127.0.0.1',
  port: 8848,
  duration: 4000,
  disabled: false
}

export default class WebpackPrerenderPlugin {

  constructor(options) {
    this.options = {
      ...defaults,
      ...options
    }
  }

  apply(compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      if (this.options.disabled) {
        return callback()
      }
      const app = express()
      const {staticPath, host, port, duration, selector, template, replacement} = this.options

      // run a web server
      app.use(express.static(path.resolve(compiler.outputPath, '.' + this.options.staticPath)))
      app.listen(port, async () => {

        // get html string from browser
        const html = await this.getHtml(
          'http://' + host + ':' + port,
          duration,
          selector
        )

        // write html file
        const filepath = path.resolve(compiler.outputPath, template)
        let filetext = fs.readFileSync(filepath, 'utf-8').toString()
        filetext = filetext.replace(replacement, html)
        fs.writeFileSync(filepath, filetext)

        callback()

        // close the server
        process.exit()
      })
    })
  }

  async getHtml(url, duration, selector) {
    // open the web page
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
    const page = await browser.newPage()
    await page.goto(url)

    // delay for browser rendering
    await delay(duration)

    // get html string
    return await page.$eval(selector, e => e.innerHTML)
  }
}
