'use strict';

const template = require('jm-template');

module.exports = class JmtemplateView {

  constructor(ctx) {
    this.ctx = ctx;
    this.app = ctx.app;
    this.config = ctx.app.config.jmtemplate;
  }

  async render(filename, locals, viewOptions) {
    const config = Object.assign({}, this.config, viewOptions, { cache: null });
    return new Promise(function(resolve, reject) {
      template.render(filename, {
        data: locals,
        filters: {}, // filters
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
    //const config = Object.assign({}, this.config, viewOptions, { cache: null });
    try {
      let result = template.renderString(tpl, locals, {});
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(err);
    }
  }

};