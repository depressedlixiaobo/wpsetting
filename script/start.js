const webpack = require('webpack')
const wpConfig = require('../config/webpack.dev.js')
const createCompiler = require('../config/common/CreateCompiler')
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('../config/common/ClearConsole')
const address = require('address')
const chalk =require('chalk')
const devServerConfig = require('../config/dev-server.config')
const openBrowser = require('../config/common/openBrowser')
const url = require('url');

let port = 3000
let HOST = address.ip()
const isInteractive = process.stdout.isTTY;
const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const urls =prepareUrls(protocol,HOST,port)

const compiler = createCompiler(webpack,wpConfig,'APPNAME',false,urls)
const devServer = new WebpackDevServer(compiler,devServerConfig(HOST,port));

devServer.listen(port, HOST, err => {
    if (err) {
        return console.log(err);
    }
    if (isInteractive) {
        clearConsole();
    }
    console.log(chalk.cyan('正在启动开发者服务器，请稍后...\n'));
    openBrowser(urls.localUrlForBrowser);
});

['SIGINT', 'SIGTERM'].forEach(function (sig) {
    process.on(sig, function () {
        devServer.close();
        process.exit();
    });
});

function prepareUrls(protocol, host, port) {
    const formatUrl = hostname =>
        url.format({
            protocol,
            hostname,
            port,
            pathname: '/',
        });
    const prettyPrintUrl = hostname =>
        url.format({
            protocol,
            hostname,
            port: chalk.bold(port),
            pathname: '/',
        });

    const isUnspecifiedHost = host === '0.0.0.0' || host === '::';
    let prettyHost, lanUrlForConfig, lanUrlForTerminal;
    if (isUnspecifiedHost) {
        prettyHost = 'localhost';
        try {
            // This can only return an IPv4 address
            lanUrlForConfig = address.ip();
            if (lanUrlForConfig) {
                // Check if the address is a private ip
                // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
                if (
                    /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
                        lanUrlForConfig
                    )
                ) {
                    // Address is private, format it for later use
                    lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
                } else {
                    // Address is not private, so we will discard it
                    lanUrlForConfig = undefined;
                }
            }
        } catch (_e) {
            // ignored
        }
    } else {
        prettyHost = host;
    }
    const localUrlForTerminal = prettyPrintUrl(prettyHost);
    const localUrlForBrowser = formatUrl(prettyHost);
    return {
        lanUrlForConfig,
        lanUrlForTerminal,
        localUrlForTerminal,
        localUrlForBrowser,
    };
}