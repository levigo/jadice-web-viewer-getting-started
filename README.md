# JwvGettingStarted

Steps in this commit:

* add the auto-generated angular files to the .gitignore
* manually change the version to the most recent versions according to npmjs.com, as far as possible
* for bigger upgrades, delete all the temp files and also the package-lock.json
  * as this was an upgrade from angular 12 to 19, adapt the angular.json (shouldn't be necessary if you create a project from scratch)
* run ```npm install```
