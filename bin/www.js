#! /usr/bin/env node
//告诉操作系统执行这个脚本的时候，调用/usr/bin下的node解释器;

const Server = require('../server'); //导入Server
const commander = require('commander'); //导入命令行模块
const {version} = require('../package.json');  //读取package.json的版本

//配置命令行
commander
  .option('-p,--port <n>', 'config port') //配置端口
  .option('-o,--host [value]', 'config hostname') //配置主机名
  .option('-d,--dir [value]', 'config directory') //配置访问目录
  .option('-P,--proxyUrl [value]', 'config proxy')  //配置转发地址
  .version(version, '-v,--version') //展示版本
  .parse(process.argv);

const server = new Server(commander);
server.start();