'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const delay = ms => new Promise(res => setTimeout(res, ms));
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
};

class WebpackPrerenderPlugin {

  constructor(options) {
    this.options = _extends({}, defaults, options);
  }

  apply(compiler) {
    var _this = this;

    compiler.plugin('after-emit', (compilation, callback) => {
      if (this.options.disabled) {
        return callback();
      }
      const app = (0, _express2.default)();
      const { staticPath, host, port, duration, selector, template, replacement } = this.options;

      // run a web server
      app.use(_express2.default.static(_path2.default.resolve(compiler.outputPath, '.' + this.options.staticPath)));
      app.listen(port, _asyncToGenerator(function* () {

        // get html string from browser
        const html = yield _this.getHtml('http://' + host + ':' + port, duration, selector);

        // write html file
        const filepath = _path2.default.resolve(compiler.outputPath, template);
        let filetext = _fs2.default.readFileSync(filepath, 'utf-8').toString();
        filetext = filetext.replace(replacement, html);
        _fs2.default.writeFileSync(filepath, filetext);

        callback();

        // close the server
        process.exit();
      }));
    });
  }

  getHtml(url, duration, selector) {
    return _asyncToGenerator(function* () {
      // open the web page
      const browser = yield _puppeteer2.default.launch({ args: ['--no-sandbox'] });
      const page = yield browser.newPage();
      yield page.goto(url);

      // delay for browser rendering
      yield delay(duration);

      // get html string
      return yield page.$eval(selector, function (e) {
        return e.innerHTML;
      });
    })();
  }
}
exports.default = WebpackPrerenderPlugin;