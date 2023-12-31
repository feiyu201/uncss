#!/usr/bin/env node

/* eslint-disable no-console */
'use strict';

(function () {
    process.title = 'uncss';

    const uncss = require('../src/uncss.js'),
        data = require('../package.json'),
        program = require('commander'),
        fs = require('fs');

    function listArg(val) {
        return val.split(',');
    }

    program
        .version(data.version)
        .usage(
            '[options] <file or URL, ...>\n\t e.g. uncss https://getbootstrap.com/docs/3.3/examples/jumbotron/ > stylesheet.css'
        )
        .option('-i, --ignore <selector, ...>', 'Do not remove given selectors', listArg)
        .option('-m, --media <media_query, ...>', 'Process additional media queries', listArg)
        .option('-C, --csspath <path>', 'Relative path where the CSS files are located')
        .option('-s, --stylesheets <file, ...>', 'Specify additional stylesheets to process', listArg)
        .option('-S, --ignoreSheets <selector, ...>', 'Do not include specified stylesheets', listArg)
        .option('-r, --raw <string>', 'Pass in a raw string of CSS')
        .option('-t, --timeout <milliseconds>', 'Wait for JS evaluation')
        .option('-H, --htmlroot <folder>', "Absolute paths' root location")
        .option('-u, --uncssrc <file>', 'Load these options from <file>')
        .option('-n, --noBanner', 'Disable banner')
        .option('-a, --userAgent <string>', 'Use a custom useragent string')
        .option('-I, --inject <file>', 'Path to javascript file to be executed before uncss runs')
        .option('-o, --output <file>', 'Path to write resulting CSS to')
        .parse(process.argv);

    const options = {
        ignore: program.ignore,
        ignoreSheets: program.ignoreSheets,
        media: program.media,
        csspath: program.csspath,
        stylesheets: program.stylesheets,
        raw: program.raw,
        timeout: program.timeout,
        htmlroot: program.htmlroot,
        uncssrc: program.uncssrc,
        banner: !program.noBanner,
        userAgent: program.userAgent,
        inject: program.inject,
    };

    if (program.args.length) {
        if (options.ignore) {
            options.ignore = options.ignore.map((ign) => {
                /* Create RegExes */
                if (ign[0] === '/') {
                    /* Remove starting and trailing '/' */
                    return new RegExp(ign.slice(1, -1));
                }
                return ign;
            });
        }

        if (options.ignoreSheets) {
            options.ignoreSheets = options.ignoreSheets.map((ign) => {
                /* Create RegExes */
                if (ign[0] === '/') {
                    /* Remove starting and trailing '/' */
                    return new RegExp(ign.slice(1, -1));
                }
                return ign;
            });
        }

        /* If used from the command line, concatenate the output */
        uncss(program.args, options, (err, css) => {
            if (err) {
                throw err;
            }
            if (program.output) {
                fs.writeFile(program.output, css, 'utf8', (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log(`${program.output} has been saved!`);
                });
            } else {
                console.log(css);
            }
        });
    } else {
        /* No files were specified, read HTML from stdin */
        let buffer = '';

        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (chunk) => {
            buffer += chunk;
        });

        process.stdin.on('end', () => {
            uncss(buffer, options, (err, css) => {
                if (err) {
                    throw err;
                }
                console.log(css);
            });
        });
    }
})();
