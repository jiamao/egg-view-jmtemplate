'use strict';

const path = require('path');
const fs = require('fs');
const template = require('jm-template');

module.exports = class JmtemplateView {

  constructor(ctx) {
    this.ctx = ctx;
    this.app = ctx.app;
    this.config = ctx.app.config.jmtemplate;
    this.filters = this.getFilters(); // 加载filters
    console.log('create jmtemplate instance');
  }

  async render(filename, locals, viewOptions) {
    const config = Object.assign({}, this.config, viewOptions, { cache: null });
    const filters = Object.assign({}, this.filters, config.filters);
    return new Promise(function(resolve, reject) {
      template.render(filename, {
        data: locals,
        filters: filters, // filters
        root: config.root
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
      let result = template.renderString(tpl, locals, filters);
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
      
      const filterPath = require.resolve(path.join(unit.path, 'app/extend/filter'));
      if (!filterPath) continue;
      const tmp = this.app.loader.loadFile(filterPath) || {};
      for (const key of Object.keys(tmp)) {
        filters[key] = tmp[key];
      }
    }
    return filters;
  }
};