#!/usr/bin/env node

var https = require('https')
var fs = require('fs')
var parse = require('url').parse
var domain = require('./domain')

var ssl_port = 443

function server(req, res) {

  var path = parse(req.url)
  console.log('path', path, req.method)
  if (path.pathname === '/config.json') {
    function error(e) {
      res.writeHead(500)
      res.write(e.message)
      res.end()
    }

    fs.readFile('./config.json', function(err, json) {
      if (err) return  error(err)
      try {
        json = JSON.parse(json.toString('utf8'))
        var pfx = 'https://' + domain.get() +
          (ssl_port === 443 ? '' : ':' + ssl_port) + '/'
        json.appConfig.app_url = pfx
        json.appConfig.help_url = pfx + '/help.html'
      }
      catch(e) {
        return error(e)
      }
      res.writeHead(200, {'Content-type': 'application/json'})
      res.end(JSON.stringify(json))
    })
    return
  }

  res.writeHead(404)
  res.end()
}

var sslOptions = {
  key: fs.readFileSync('ssl-key.pem'),
  cert: fs.readFileSync('ssl-cert.pem')
}

https.createServer(sslOptions, server).listen(ssl_port)