'use strict';

module.exports = app => {
  app.view.use('jmtemplate', require('./lib/view'));
};