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
    this.env = this.getSSIEnv(); // 环境变量 给ssi使用
    this.renderer = new template(this.config, this.env);
  }

  async render(filename, locals, viewOptions) {
    if(!path.existsSync(filename)) {
      this.body = `${filename} is not exists`;
      this.status = 404;
      return Promise.reject(this.body);
    }
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
   // 获取ssi执行常量
  getSSIEnv() {
    const env = {};
    env['HTTP_USER_AGENT'] = this.ctx.request.headers['user-agent'] || '';
    env['REMOTE_ADDR'] = this.ctx.ip;
    env['REMOTE_PORT'] = this.ctx.port;
    env['HTTP_HOST'] = this.ctx.request.hostname;
    env['HTTP_COOKIE'] = this.ctx.req.headers['cookie'] || '';
    env['QUERY_STRING_UNESCAPED'] = this.ctx.req.href;
    env['QUERY_STRING'] = this.ctx.req.querystring;
    env['DOCUMENT_ROOT'] = this.config.root || '';
    env['SERVER_SOFTWARE'] = 'Nginx';
    return env;
  }
};