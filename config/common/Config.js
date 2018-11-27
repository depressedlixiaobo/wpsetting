const path = require('path');
const fs = require('fs');

class ComConfig{
    constructor(){
        this.env = process.env.NODE_ENV
        this.appDirectory = fs.realpathSync(process.cwd());
    }
    /**
     * 获取packgejson文件
     */
    getpackJson(){
        let pckJson =  path.resolve(this.appDirectory, 'package.json')
        return  JSON.parse(fs.readFileSync(pckJson, 'utf8'))
    }
    /**
     * 获取publicPath  这个目录 是 发布时候 添加到静态资源上的
     */
    publicPath() {
        let subPath = ''
        if (this.env === 'production') {
            subPath = this.getpackJson().homepage || '/'
        }
        return subPath || '/'
    }
    /**
     * 解决地址问题 输出绝对地址
     */
    resolveApp (relativePath){
       return  path.resolve(this.appDirectory, relativePath)
    }

    getDir () {
        return {
            appSrc: this.resolveApp('src'),
            appBuild: this.resolveApp('build'),
            appHtml: this.resolveApp('public/index.html'),
            appIndexJs: this.resolveApp('src/index.js'),
            appPublic: this.resolveApp('public'),
        }
    }
}

module.exports = ComConfig