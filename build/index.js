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
  serverPath: '/',
  host: '127.0.0.1',
  port: 8848,
  route: '/',
  duration: 4000,
  template: 'index.html',
  selector: '#root',
  pattern: '%render-html%',
  enabled: true
};

class WebpackPrerenderPlugin {

  constructor(options) {
    this.options = _extends({}, defaults, options);
  }

  apply(compiler) {
    var _this = this;

    compiler.plugin('after-emit', (compilation, callback) => {
      if (!this.enabled) {
        return callback();
      }
      const app = (0, _express2.default)();
      const port = 8848;

      app.use(_express2.default.static(compiler.outputPath));

      app.listen(port, _asyncToGenerator(function* () {
        console.log('app listen on', port);
        const html = yield _this.getHtml('http://' + _this.options.host + ':' + _this.options.port, _this.options.duration, _this.options.selector);

        const filepath = _path2.default.resolve(compiler.outputPath, _this.options.template);
        let filetext = _fs2.default.readFileSync(filepath, 'utf-8').toString();
        filetext = filetext.replace(_this.options.pattern, html);

        _fs2.default.writeFileSync(filepath, filetext);

        callback();

        process.exit();
      }));
    });
  }

  getHtml(url, duration, selector) {
    return _asyncToGenerator(function* () {
      const browser = yield _puppeteer2.default.launch({ args: ['--no-sandbox'] });

      const page = yield browser.newPage();

      yield page.goto(url);

      yield delay(duration);

      return yield page.$eval(selector, function (e) {
        return e.innerHTML;
      });
    })();
  }
}
exports.default = WebpackPrerenderPlugin;