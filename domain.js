#!/usr/bin/env node

var fs = require('fs')
var path = require('path')

var storePath = path.join(__dirname, '.domain')

function set(value) {
  if (typeof value === 'string') {
    fs.writeFileSync(storePath, value, {encoding: 'utf8'})
  }
  else {
    fs.unlinkSync(storePath)
  }
}

function get() {
  if (fs.existsSync(storePath)) {
    return fs.readFileSync(storePath, {encoding: 'utf8'})
  }

  var os = require('os')
  var ifs = os.networkInterfaces()
  for (var i in ifs) {
    for (var j = 0; j < ifs[i].length; j++) {
      var dev = ifs[i][j]
      if (dev.family === 'IPv4' && dev.address !== '127.0.0.1') {
        return dev.address
      }
    }
  }
  return ''
}

exports.set = set
exports.get = get

if (!module.parent) {
  var argv = require('optimist').argv
  if (argv.set) set(argv.set)
  console.log(get())
}