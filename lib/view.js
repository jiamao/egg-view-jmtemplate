'use strict';

const fs = require('fs');
const path = require('path');
const template = require('./template.js');

module.exports = class JmtemplateView {

  constructor(ctx) {
    this.ctx = ctx;
    this.app = ctx.app;
    this.config = ctx.app.config.jmtemplate;
    this.filters = this.getFilters(); // 加载filters
    this.renderer = new template(this.config);
  }

  async render(filename, locals, viewOptions) {
    const config = Object.assign({}, this.config, viewOptions, { cache: null });
    const filters = Object.assign({}, this.filters, config.filters);
    return this.renderer.render(filename, {
      data: locals,
      config: config,
      filters: filters
    });
  }

  renderString(tpl, locals, viewOptions) {
    // should disable cache when no filename
    const config = Object.assign({}, this.config, viewOptions, { cache: null });
    try {
      const filters = Object.assign({}, this.filters, config.filters);
      return this.renderer.renderString(tpl, {
        data: locals,
        config: config,
        filters: filters
      });
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