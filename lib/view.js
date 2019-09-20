'use strict';

const path = require('path');
const fs = require('fs');
const SSI = require('node-ssi');
const template = require('jm-template');

module.exports = class JmtemplateView {

  constructor(ctx) {
    this.ctx = ctx;
    this.app = ctx.app;
    this.config = ctx.app.config.jmtemplate;
    this.filters = this.getFilters(); // 加载filters
    //console.log('create jmtemplate instance');
    if(this.config.ssi) {
      this.ssi = new SSI({
        baseDir: this.config.root,
        encoding: 'utf-8',
        // 预输入一些变量
        payload: {
            //v: 5
        }
      });
    }
  }

  async render(filename, locals, viewOptions) {
    const config = Object.assign({}, this.config, viewOptions, { cache: null });
    const filters = Object.assign({}, this.filters, config.filters);
    const ssi = this.ssi;
    return new Promise(function(resolve, reject) {
      template.render(filename, {
        data: locals,
        filters: filters, // filters
        root: config.root,
        // 模板预处理回调
        preResolveTemplate: function(content, path, options, callback) {
          // 如果开启了ssi能力，调用ssi
          if(ssi && config.ssi) {
            ssi.compile(content, function(err, content){
              callback && callback(err, content);
            });
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

  renderString(tpl, locals, viewOptions) {
    // should disable cache when no filename
    const config = Object.assign({}, this.config, viewOptions, { cache: null });
    try {
      const filters = Object.assign({}, this.filters, config.filters);
      const ssi = this.ssi;
      
      let result = template.renderString(tpl, {
        data: locals,
        filters: filters, // filters
        root: config.root,
        preResolveTemplate: function(content, path, options, callback) {
          // 如果开启了ssi能力，调用ssi
          if(ssi && config.ssi) {
            ssi.compile(content, function(err, content){
              callback && callback(err, content);
            });
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

  // 获取filters
  getFilters() {
    const filters = {};
    for (let unit of this.app.loader.getLoadUnits()) {
      let p = path.join(unit.path, 'app/extend/filter');
      if(!fs.existsSync(p)) continue;
      
      const filterPath = require.resolve(p);
      if (!filterPath) continue;
      const tmp = this.app.loader.loadFile(filterPath) || {};
      for (const key of Object.keys(tmp)) {
        filters[key] = tmp[key];
      }
    }
    return filters;
  }
};