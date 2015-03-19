#!/usr/bin/env node
/*global require, console, process*/
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var xpath = require('xpath');
var myDOMParser = require('xmldom').DOMParser;

var VERSIONTYPES = ['major', 'minor', 'patch'];
var versionToBump = (typeof argv.vType === 'undefined') ? 2 : argv.vType;
var itsABuildFile = false;
var fileName = argv.file; // || 'manifest.xml';
if (typeof fileName !== 'undefined') {
    var dir = fs.readdirSync(process.cwd());
    for (var i=0; i < dir.length; i++) {
        if (dir[i] === 'manifest.xml') {
            fileName = 'manifest.xml';
            break;
        }
        if (dir[i] === 'build.xml') {
            fileName = 'build.xml';
            break;
        }
    }
    var itsABuildFile = fileName.substr(fileName.length - 9) === 'build.xml';
}
var xpathToVersion = argv.xpath || (itsABuildFile ? '//property[@name="module.version"]' : '//module/version');
var enforcedVersion = argv.version;
var preserveFile = argv.preserveFile;
var change = argv.change || argv.c;
var verbose = argv.verbose || argv.v;

if (argv.help || argv.h) {
    console.log('bumpIt bumps module versions in manifest files.');
    console.log('Usage: bumpIt [--help][--change][--file=<FILENAME>][--vType=<0|1|2>][--version=<ENFORCEDVERSION>][--xpath=<XPATHTOVERSIONNODE>][--preserveFile][--verbose]');
    console.log('NOTE: It HAS to be a version number of the type major.minor.patch');
    console.log('      If it is called in a directory with a build.xml or a manifest.xml, it will automatically target those files!');
    console.log('      If called without the --c parameter, it will only state the version, not bump it.\n');
    console.log('Parameters:\n----------');
    console.log('--help | --h\t\tPrint out this help');
    console.log('--change | --c\t\tActual change the version number. Without this option,\n\t\t\tit will only fetch and print out the version.');
    console.log('--file\t\t\tTarget file to alter. If none is defined, it looks after\n\t\t\tbuild.xml or manifest.xml in the working directory. If both are present, it targets build.xml');
    console.log('--vType\t\t\tThe type of version to bump. 0 = major, 1=minor, 2=patch.\n\t\t\tDoes nothing if --c is not used.');
    console.log('--verbose | --v\t\tPrint out verbose format (filename + new version).');
    console.log('--version\t\tEnforce a specific version no matter what the version was before.');
    console.log('--xpath\t\t\tDefine xpath to use, in search of version node. If none is\n\t\t\tdefined, it will use for \'//property[@name="module.version"]\' build.xml, and \'//module/version\' for manifests.');
    console.log('--perserveFile\t\tIf set, the result will be a file called the same as\n\t\t\tthe target file postfixed with "_NEW", and the original file will be preserved.');
} else {
    if (!fileName){
        console.log('bumpIt bumps versions of modules in manifests and build xml files. Use --help to get help.');
        process.exit();
    }
    fs.readFile(fileName, 'utf-8', function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        var doc = new myDOMParser().parseFromString(data);
        var versionNodes = xpath.select(xpathToVersion, doc);
        var version = (!itsABuildFile) ? versionNodes[0].firstChild.data.split('.') : versionNodes[0].getAttribute('value').split('.');
        if (change) {
            if (!verbose) {
                console.log('Bumping ' + VERSIONTYPES[versionToBump] + ' version nummer from ' + version.join('.'));
            }
            version[versionToBump] = (parseInt(version[versionToBump], 10) + 1) + '';
            if (versionToBump === 0) {
                version[1] = '0';
                version[2] = '0';
            }
            if (versionToBump === 1) {
                version[2] = '0';
            }
            var newVersion = (typeof enforcedVersion !== 'undefined') ? enforcedVersion : version.join('.');
            if (!verbose) {
                console.log('New version is ' + newVersion);
            } else {
                console.log(process.cwd() + fileName + ' ' + newVersion);
            }
            if (!itsABuildFile) {
                versionNodes[0].firstChild.data = newVersion;
            } else {
                versionNodes[0].setAttribute('value', newVersion);
            }
            fs.writeFile(fileName + '_NEW', doc, 'utf-8', function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                if (!preserveFile) {
                    fs.rename(fileName + '_NEW', fileName, function (err) {
                        if (err) {
                            console.log(err);
                            console.log('Something went wrong - the new file might be in ' + fileName + '_NEW ?\n\nSorry for any inconveniences.');
                        }
                    });
                }
            });
        } else {
            if (!verbose) {
                console.log(fileName + ' states module version: ' + version.join('.'));
            } else {
                console.log(process.cwd() + fileName + ' ' + version.join('.'));
            }
        }
    });
}
