const http = require('http');
const colors = require('colors');
const url = require('url');
const path = require('path');
class Server {  
  constructor(){
    // super()
    this.config = {
      host:"localhost",
      port:12121
    }
  }

  // let config = {
  //   host:"localhost",
  //   port:3000
  // }

  async  handleRequest(req, res) {
    const { dir, proxyUrl } = this.config;
    let { pathname } = url.parse(req.url);
    pathname = decodeURIComponent(pathname);
    const fileUrl = path.join(dir, pathname);
    try {
      //判断当前路径是文件 还是文件夹
      const statObj = await statObj(fileUrl);
      if (statObj.isDirectory()) {
        //文件夹则输出对应的目录
        this.sendDir(req, res, pathname, fileUrl);
      } else {
        //文件则直接输出内容
        this.sendFile(req, res, statObj, fileUrl);
      }
    } catch (e) {
      //转发请求
      if (proxyUrl) {
        this.proxy(req, res, proxyUrl);
      } else {
        this.senError(req, res);
      }
    }
  }

  //获取文件夹目录
  async  sendDir(req, res, pathname, fileUrl) {
    //读取当前访问的目录下的而所有内容readdir数组把数组渲染回页面
    res.setHeader('Content-Type', 'text/html;charset=utf8')
    let dirs = await readdir(fileUrl);
    dirs = dirs.map(item => ({
      name: item,
      //因为点击第二层时，需要带上第一层的路径，所以拼接就ok
      href: path.join(pathname, item)
    }))
    //渲染template.html中需要填充的内容，name是当前文件目录。arr为当前文件夹下的目录数组
    const str = pug.render(this.template, {
      arr: dirs
    });
    //响应中返回填充内容
    res.end(str);
  }

  //获取文件信息
  sendFile(req, res, statObj, fileUrl) {
    //管道读写操作，将fs.createReadStream(p)的内容写入到res
    //return fs.createReadStream(fileUrl).pipe(res);
    fs.readFile(fileUrl, 'utf-8', (err, data)=>{
      if (err) {
        throw err;
      }
      res.end(data);
    })
  }

  //代理
  proxy(req, res, proxyUrl) {
    delete req.headers.host;
    var proxy = httpProxy.createProxyServer({});
    proxy.web(req, res, {
      target: proxyUrl
    });
  }

  //启动
  start() {
    const server = http.createServer(this.handleRequest.bind(this));
    server.listen(this.config.port, this.config.host, () => {
      console.log(`server start http://${this.config.host}:${colors.green(this.config.port)}`);

      //代理
      if (this.config.proxyUrl) {
        console.log(colors.yellow('Unhandled requests will be served from:' + this.config.proxyUrl));
      }
    })
  }
}

module.exports = Server;