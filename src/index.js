import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import express from 'express'

const delay = ms => new Promise(res => setTimeout(res, ms))
const defaults = {
  serverPath: '/',
  host: '127.0.0.1',
  port: 8848,
  route: '/',
  duration: 4000,
  template: 'index.html',
  selector: '#root',
  pattern: '%render-html%',
  enabled: true
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
      if (!this.enabled) {
        return callback()
      }
      const app = express()
      const port = 8848

      app.use(express.static(compiler.outputPath))

      app.listen(port, async () => {
        console.log('app listen on', port)
        const html = await this.getHtml(
          'http://' + this.options.host + ':' + this.options.port,
          this.options.duration,
          this.options.selector
        )

        const filepath = path.resolve(compiler.outputPath, this.options.template)
        let filetext = fs.readFileSync(filepath, 'utf-8').toString()
        filetext = filetext.replace(this.options.pattern, html)

        fs.writeFileSync(filepath, filetext)

        callback()

        process.exit()
      })
    })
  }

  async getHtml(url, duration, selector) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] })

    const page = await browser.newPage()

    await page.goto(url)

    await delay(duration)

    return await page.$eval(selector, e => e.innerHTML)
  }
}
