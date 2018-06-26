# Prerender-webpack-plugin

    What is Prerendering?

    Pre-rendering describes the process of rendering a client-side application at build time, producing useful static HTML that can be sent to the browser instead of an empty bootstrapping page.

    Pre-rendering is like Server-Side Rendering, just done at build time to produce static files. Both techniques help get meaningful content onto the user's screen faster.

## How does it work?

1. After build, run a static web server using new files with `express` .
2. Open the web page with `puppeteer`, a headless browser.
3. After the browser rendering, get the html string and write it to html file.

## Usage

Intall `prerender-webpack-plugin` as a development dependency:
```
npm i -D prerender-webpack-plugin
```

Add plugin to your webpack configuration:

```
const PrerenderWebpackPlugin = require('Prerender-webpack-plugin').default

...
    plugins: [
        new PrerenderWebpackPlugin()
    ]
...

or pass options

...
    plugins: [
        new PrerenderWebpackPlugin({
            ...options
        })
    ]
...

```

## Options

All options are optional.

| Option        | Type    | Default       | Description |
|---------------|---------|---------------|-------------|
| `staticPath`  | string  | /             | The static path of web server, '/' means the out path of webpack config
| `route`       | string  | /             | The page will be open in browser, and save it to html file
| `template`    | string  | index.html    | HTML file to update
| `selector`    | string  | #root         | HTML string wrapper
| `replacement` | string  | {{prerender}} | The string will be replaced with prerender HTML
| `host`        | string  | 127.0.0.1     | Host of web server
| `port`        | number  | 8848          | Port of web server
| `duration`    | number  | 4000          | Millseconds waiting for browser render the page
| `disabled`    | boolean | false         | Determine plugin work or not
