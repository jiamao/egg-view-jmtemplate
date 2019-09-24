# egg-view-jmtemplate

egg view plugin for [jm-template].

## Install

```bash
$ npm i egg-view-jmtemplate --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.jmtemplate = {
  enable: true,
  package: 'egg-view-jmtemplate',
  // root: path.join(appInfo.baseDir, 'app/view')
};

// {app_root}/config/config.default.js
exports.view = {
  mapping: {
    '.html': 'jmtemplate',
  },
};

// jmtemplate config
exports.jmtemplate = {
  ssi: false // true 可以开始ssi支持
};
```

Create a jmtemplate file

```html
<!-- banner.html -->
<% for ( var i = 0; i < users.length; i++ ) { %>
    <li><a href="<%=users[i].url%>"><%=users[i].name | add(6) %></a></li>
<% } %>
```

Render it

```js
// app/controller/render.js
exports.jmtemplate = async ctx => {
  await ctx.render('banner.html', {
    data: {
      users: [
          {url:'http://qqq.com', name: "jiamao"},
          {url:'http://qqq2.com', name: "jiamao2"}
      ]
    },
  }, {
    // 可以传临时filter
    filters: {
      add: (name, len) => return name.substr(0, len || 4)
    }
  });
};
```

#### Filters
`filter`可以写在扩展中， 或者在`render`时传递。
```js
// {app_root}/app/extend/filter.js
exports.add = (name, len) => return name.substr(0, len || 4);
```

#### SSI
如果配置开启了`ssi`,这里模拟的是nginx环境，支持以下变量：
```js
env['HTTP_USER_AGENT'] = this.ctx.request.headers['user-agent'] || '';
env['REMOTE_ADDR'] = this.ctx.ip;
env['REMOTE_PORT'] = this.ctx.port;
env['HTTP_HOST'] = this.ctx.request.hostname;
env['HTTP_COOKIE'] = this.ctx.req.headers['cookie'] || '';
env['QUERY_STRING_UNESCAPED'] = this.ctx.req.href;
env['QUERY_STRING'] = this.ctx.req.querystring;
env['DOCUMENT_ROOT'] = this.config.root || '';
env['SERVER_SOFTWARE'] = 'Nginx';
```
## License

[MIT](LICENSE)

[jm-template]: https://github.com/jiamao/jm-template
