const path = require('path');

  module.exports = appInfo => {
    return {
      /**
       * @member Config#jm-template
       */
      jmtemplate: {
        root: path.join(appInfo.baseDir, 'app/view'),
        cache: true,
        debug: false
      },
    };
  };