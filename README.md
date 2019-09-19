# egg-view-jmtemplate

egg view plugin for [jm-template].

## Install

```bash
$ npm i egg-view-jmtemplate --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.htmling = {
  enable: true,
  package: 'egg-view-jmtemplate',
};

// {app_root}/config/config.default.js
exports.view = {
  mapping: {
    '.html': 'jmtemplate',
  },
};

// htmling config
exports.jmtemplate = {};
```

Create a jmtemplate file

```html
<!-- banner.html -->
<% for ( var i = 0; i < users.length; i++ ) { %>
    <li><a href="<%=users[i].url%>"><%=users[i].name%></a></li>
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
  });
};
```


## License

[MIT](LICENSE)

[jm-template]: https://github.com/jiamao/jm-template
