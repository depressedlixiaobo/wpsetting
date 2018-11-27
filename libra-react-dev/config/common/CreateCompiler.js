const chalk = require('chalk');
const clearConsole = require('./ClearConsole');
const formatWebpackMessages = require('./formatWebpackMessages')

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
function printInstructions(appName, urls, useYarn) {
    console.log();
    console.log(`你现在可以在浏览器中预览此项目了`);//${chalk.bold(appName)}
    console.log();
  
    if (urls.lanUrlForTerminal) {
      console.log(
        `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
      );
      console.log(
        `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`
      );
    } else {
      console.log(`  ${urls.localUrlForTerminal}`);
    }
  
    console.log();
    console.log('注意 ，在开发者模式下 并不会将资源进项压缩。');
    console.log(
        `编译生产环境, 可以使用命令 ` +
          `${chalk.cyan(`npm run build`)}.`
      );
   // console.log('Note that the development build is not optimized.');
    // console.log(
    //   `To create a production build, use ` +
    //     `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`
    // );
    console.log();
  }
function createCompiler(webpack, config, appName, urls, useYarn) {
    const isInteractive = process.stdout.isTTY;
     
    let compiler;
    try {
      compiler = webpack(config);
    } catch (err) {
      console.log(chalk.red('编译错误,信息如下：'));
      console.log();
      console.log(err.message || err);
      console.log();
      process.exit(1);
    }
  
    // "invalid" event fires when you have changed a file, and Webpack is
    // recompiling a bundle. WebpackDevServer takes care to pause serving the
    // bundle, so if you refresh, it'll wait instead of serving the old one.
    // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
    compiler.hooks.invalid.tap('invalid', () => {
      if (isInteractive) {
        clearConsole();
      }
      console.log('编译中...');
    });
  
    let isFirstCompile = true;
   
    compiler.hooks.done.tap('done', stats => {
      if (isInteractive) {
        clearConsole();
      }
  
      // We have switched off the default Webpack output in WebpackDevServer
      // options so we are going to "massage" the warnings and errors and present
      // them in a readable focused way.
      // We only construct the warnings and errors for speed:
      // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
      const messages = formatWebpackMessages(
        stats.toJson({ all: false, warnings: true, errors: true })
      );
      const isSuccessful = !messages.errors.length && !messages.warnings.length;
      if (isSuccessful) {
        console.log(chalk.green('编译成功!'));
      }
      if (isSuccessful && (isInteractive || isFirstCompile)) {
        printInstructions(appName, urls, useYarn);
      }
      isFirstCompile = false;
  
      // If errors exist, only show errors.
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        console.log(chalk.red('编译失败.\n'));
        console.log(messages.errors.join('\n\n'));
        return;
      }
  
      // Show warnings if no errors were found.
      if (messages.warnings.length) {
        console.log(chalk.yellow('编译成功，但是有如下警告请注意.\n'));
        console.log(messages.warnings.join('\n\n'));
  
        // Teach some ESLint tricks.
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        );
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        );
      }
    });
    return compiler;
  }

module.exports = createCompiler