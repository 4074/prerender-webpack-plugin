'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var delay = function delay(ms) {
  return new Promise(function (res) {
    return setTimeout(res, ms);
  });
};
var defaults = {
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

var WebpackPrerenderPlugin = function () {
  function WebpackPrerenderPlugin(options) {
    _classCallCheck(this, WebpackPrerenderPlugin);

    this.options = _extends({}, defaults, options);
  }

  _createClass(WebpackPrerenderPlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('after-emit', function (compilation, callback) {
        if (!_this.enabled) {
          return callback();
        }
        var app = (0, _express2.default)();
        var port = 8848;

        app.use(_express2.default.static(compiler.outputPath));

        app.listen(port, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          var html, filepath, filetext;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  console.log('app listen on', port);
                  _context.next = 3;
                  return _this.getHtml('http://' + _this.options.host + ':' + _this.options.port, _this.options.duration, _this.options.selector);

                case 3:
                  html = _context.sent;
                  filepath = _path2.default.resolve(compiler.outputPath, _this.options.template);
                  filetext = _fs2.default.readFileSync(filepath, 'utf-8').toString();

                  filetext = filetext.replace(_this.options.pattern, html);

                  _fs2.default.writeFileSync(filepath, filetext);

                  callback();

                  process.exit();

                case 10:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this);
        })));
      });
    }
  }, {
    key: 'getHtml',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url, duration, selector) {
        var browser, page;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _puppeteer2.default.launch({ args: ['--no-sandbox'] });

              case 2:
                browser = _context2.sent;
                _context2.next = 5;
                return browser.newPage();

              case 5:
                page = _context2.sent;
                _context2.next = 8;
                return page.goto(url);

              case 8:
                _context2.next = 10;
                return delay(duration);

              case 10:
                _context2.next = 12;
                return page.$eval(selector, function (e) {
                  return e.innerHTML;
                });

              case 12:
                return _context2.abrupt('return', _context2.sent);

              case 13:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getHtml(_x, _x2, _x3) {
        return _ref2.apply(this, arguments);
      }

      return getHtml;
    }()
  }]);

  return WebpackPrerenderPlugin;
}();

exports.default = WebpackPrerenderPlugin;