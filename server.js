#!/usr/bin/env node

var https = require('https')
var http = require('http')
var fs = require('fs')
var parse = require('url').parse
var domain = require('./domain')

var argv = require('optimist').argv

var isroot = process.getuid() === 0
var ssl_port = argv['ssl-port'] || (isroot ? 443 : 4443)
var http_port = argv['http-port'] || 8880

function server(req, res) {
  console.log(req)
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
        json.appConfig.params.app_url = pfx
        json.appConfig.params.help_url = pfx + 'help.html'
      }
      catch(e) {
        return error(e)
      }
      res.writeHead(200, {'Content-type': 'application/json'})
      res.write(' ')
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

https.createServer(sslOptions, server).listen(ssl_port, function() {
  console.log('HTTPS server started at: https://' + domain.get() +
    (ssl_port === 443 ? '' : ':' + ssl_port) + '/'
  )
})
http.createServer(server).listen(http_port, function() {
  console.log('HTTP server started at: http://0.0.0.0:' + http_port + '/'
  )
})