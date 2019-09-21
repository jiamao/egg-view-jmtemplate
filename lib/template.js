'use strict';

const path = require('path');
const fs = require('fs');
const SSI = require('node-ssi');
const template = require('jm-template');

module.exports = class JmtemplateHelper {

  constructor(config, env) {
      this.config = config || {};
      this.env = env || {};
    if(config.ssi) {
      //this.ssi = new SSI(config.root, '/tmp/test', '/**/*.shtml', true);
      this.ssi = new SSI({
            baseDir: config.root,
            encoding: 'utf-8',
            payload: this.env
        });
    }
  }

  async render(filename, options) {
    const ssi = this.ssi;
    const config = Object.assign({}, this.config, options.config);
    const vars = Object.assign({}, this.env, options.variables);
    return new Promise(function(resolve, reject) {
      template.render(filename, {
        data: options.data,
        filters: options.filters, // filters
        root: config.root,
        // 模板预处理回调
        preResolveTemplate: function(content, file, opt, callback) {
          // 如果开启了ssi能力，调用ssi
          if(ssi) {
              try {
                //let ret = ssi.parser.parse(file, content, vars);
                //callback && callback(null, ret.contents);
                ssi.compile(content, {
                    payload: vars
                }, function(err, content){
                    callback && callback(err, content);
                });
              }
              catch(e) {
                  callback && callback(e, content);
              }
          }
          else {
            callback && callback(null, content);
          }
        }
      }, function(err, res) {
        if(err) {
          reject && reject(err);
        }
        else {
          resolve && resolve(res);
        }
      });
    });
  }

  renderString(tpl, options) {
    try {
      const ssi = this.ssi;
      const config = Object.assign({}, this.config, options.config);
      const vars = Object.assign({}, this.env, options.variables);
      let result = template.renderString(tpl, {
        data: options.data,
        filters: options.filters, // filters
        root: config.root,
        preResolveTemplate: function(content, file, opt, callback) {
          // 如果开启了ssi能力，调用ssi
          if(ssi) {
            try {
                let ret = ssi.parser.parse(file, content, vars);
                callback && callback(null, ret.contents);
              }
              catch(e) {
                  callback && callback(e, content);
              }
          }
          else {
            callback && callback(null, content);
          }
        }
      });
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(err);
    }
  }
};