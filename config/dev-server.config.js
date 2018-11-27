
const ComConfig = require('./common/Config')

const ConfigManager = new ComConfig()
const paths = ConfigManager.getDir()

module.exports = function(HOST,port){
    return {
        compress: true,
        clientLogLevel: 'none',
        contentBase: paths.appBuild ,
        compress: true,
        port: port,
        host: HOST,
        openPage: paths.appPublic,
        overlay: true,
        quiet: true,
        publicPath: '/'
    }
}