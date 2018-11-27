const webpack = require('webpack')
const wpConfig = require('../config/webpack.prod')
const ComConfig = require('../config/common/Config')
const fs = require('fs-extra');
const formatWebpackMessages = require('../config/common/formatWebpackMessages')
const printBuildError  = require('../config/common/PrintBuildError')
const chalk =require('chalk')


const ConfigManager = new ComConfig()
const paths = ConfigManager.getDir()

//**开始编译 */
fs.emptyDirSync(paths.appBuild);
copyPublicFolder()
build(111111)
    .then(
        ({ stats, previousFileSizes, warnings }) => {
            if (warnings.length) {
                console.log(chalk.yellow('Compiled with warnings.\n'));
                console.log(warnings.join('\n\n'));
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
            } else {
                console.log(chalk.green('编译成功！\n'));
            }

            console.log('资源文件进行Gzip压缩后大小:\n');
            console.log('暂时不输出gip,后续开发')
            // printFileSizesAfterBuild(
            //     stats,
            //     previousFileSizes,
            //     paths.appBuild,
            //     WARN_AFTER_BUNDLE_GZIP_SIZE,
            //     WARN_AFTER_CHUNK_GZIP_SIZE
            // );
            // console.log();

            // const appPackage = require(paths.appPackageJson);
            // const publicUrl = paths.publicUrl;
            // const publicPath = config.output.publicPath;
            // const buildFolder = path.relative(process.cwd(), paths.appBuild);
            // printHostingInstructions(
            //     appPackage,
            //     publicUrl,
            //     publicPath,
            //     buildFolder,
            //     useYarn
            // );
        },
        err => {
            console.log(chalk.red('编译失败，原因如下：\n'));
            printBuildError(err);
            process.exit(1);
        }
    )


function build(previousFileSizes) {
    console.log('Creating an optimized production build...');

    let compiler = webpack(wpConfig);
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages;
            if (err) {
                if (!err.message) {
                    return reject(err);
                }
                messages = formatWebpackMessages({
                    errors: [err.message],
                    warnings: [],
                });
            } else {
                messages = formatWebpackMessages(
                    stats.toJson({ all: false, warnings: true, errors: true })
                );
            }
            if (messages.errors.length) {
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                return reject(new Error(messages.errors.join('\n\n')));
            }
            if (
                process.env.CI &&
                (typeof process.env.CI !== 'string' ||
                    process.env.CI.toLowerCase() !== 'false') &&
                messages.warnings.length
            ) {
                console.log(
                    chalk.yellow(
                        '\nTreating warnings as errors because process.env.CI = true.\n' +
                        'Most CI servers set it automatically.\n'
                    )
                );
                return reject(new Error(messages.warnings.join('\n\n')));
            }

            const resolveArgs = {
                stats,
                previousFileSizes,
                warnings: messages.warnings,
            };

            return resolve(resolveArgs);
        });
    });
}
function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => file !== paths.appHtml,
    });
}
