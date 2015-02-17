#!/usr/bin/env node
/*global require, console, process*/
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var xpath = require('xpath');
var myDOMParser = require('xmldom').DOMParser;

var VERSIONTYPES = ['major', 'minor', 'maintainence'];
var versionToBump = (typeof argv.version === 'undefined') ? 2 : argv.version;
var fileName = argv.file || 'manifest.xml';
var xpathToVersion = argv.xpath || '//module/version';

if (argv.help || argv.h) {
    console.log('bumpIt bumps module versions in manifest files.\n\nUsage: bumpIt [--help][--file=<FILENAME>][--version=<0|1|2>][--xpath=<XPATHTOVERSIONNODE>]');
} else {
    fs.readFile(fileName, 'utf-8', function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        var doc = new myDOMParser().parseFromString(data);
        var versionNodes = xpath.select(xpathToVersion, doc);
        var version = versionNodes[0].firstChild.data.split('.');
        console.log('Bumping ' + VERSIONTYPES[versionToBump] + ' version nummer from ' + version.join('.'));
        version[versionToBump] = (parseInt(version[versionToBump], 10) + 1) + '';
        if (versionToBump === 0) {
            version[1] = '0';
            version[2] = '0';
        }
        if (versionToBump === 1) {
            version[2] = '0';
        }
        console.log('New version is ' + version.join('.'));
        versionNodes[0].firstChild.data = version.join('.');
        fs.writeFile(fileName, doc, 'utf-8', function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    });
}
