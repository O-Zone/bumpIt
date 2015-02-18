bumpIt
======

About
-----
bumpIt is a small and simple bash tool to bump module versions in build.xml ant scripts and manifest.xml files. Made in nodejs.
It searches for build.xml or manifest.xml files in the working directory.
if one is found, it parses the xml to find the node containing the module version number, and either prints it out, or bumps it.

The version *has* to be a semantic version number (major.minor.patch)
The program expects a certain xml structure. If you cannot make it work, try defining your own xpath with the xpath parameter.
Please note that the program will target build.xml or manifest.xml files if they are present in the working directory.
However nothing will be changed if the --c parameter isn't set

Usage
-----
Clone the project, npm install and run bumpIt with node js.
If you run it with --help, you will get a full list of parameters.

Disclaimer
----------
The tool is released on MIT license. Use it as you please, but DO NOT hold me accountable in any way, if it wrecks your data!
I made it to avoid having to manually bump a tedious bunch of modules in an openCMS project.
I have NO clue how it will work in other scenaries.

If there are more than one module defined in the same file, I guess it will just bump the first one it finds, but I haven't tried it.
Feel free to copy, modify, distribute or whatever you feel like! :)

