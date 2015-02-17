#!/usr/bin/env node
/*global require, console, process*/
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var xpath = require('xpath');
var myDOMParser = require('xmldom').DOMParser;

var VERSIONTYPES = ['major', 'minor', 'patch'];
var versionToBump = (typeof argv.vType === 'undefined') ? 2 : argv.vType;
var fileName = argv.file || 'manifest.xml';
var xpathToVersion = argv.xpath || '//module/version';
var enforcedVersion = argv.version;

if (argv.help || argv.h) {
    console.log('bumpIt bumps module versions in manifest files.\n\nUsage: bumpIt [--help][--file=<FILENAME>][--vType=<0|1|2>][--version=<ENFORCEDVERSION>][--xpath=<XPATHTOVERSIONNODE>\n\nIt HAS to be a version number of the type major.minor.patch]');
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
        var newVersion = (typeof enforcedVersion !== undefined) ? enforcedVersion : version.join('.');
        console.log('New version is ' + newVersion);
        versionNodes[0].firstChild.data = newVersion;
        fs.writeFile(fileName, doc, 'utf-8', function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    });
}
