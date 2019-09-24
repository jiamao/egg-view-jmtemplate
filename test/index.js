const path = require('path');
const template = require('../lib/template.js');

const renderer = new template({
    root: path.join(__dirname, 'view'),
    ssi: true
}, {
    "HTTP_HOST": 'www.tenganxinxi.com',
    'DATE_LOCAL': '20190924154040'
});

renderer.render('./index.shtml', {
    config: {

    }
}).then((err, res) => {
    console.log(err || res);
});

