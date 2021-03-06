#!/usr/bin/env node

var https = require('https')
var http = require('http')
var fs = require('fs')
var parse = require('url').parse
var express = require('express')
var formidable = require('formidable')
var domain = require('./domain')
var vote = require('./vote')

var argv = require('optimist').argv

var isroot = process.getuid() === 0
var ssl_port = argv['ssl-port'] || (isroot ? 443 : 4443)
var http_port = argv['http-port'] || 8880

var app = express()

app.use(express.bodyParser())

var pubkey = fs.readFileSync('./rsakey.pub', 'utf8')
app.get('/config.json', function(req, res) {
  fs.readFile('./config.json', function(err, json) {

    function error(e) {
      res.writeHead(500)
      res.write(e.message)
      res.end()
    }

    if (err) return error(err)
    try {
      json = JSON.parse(json.toString('utf8'))
      var pfx = 'https://' + domain.get() +
        (ssl_port === 443 ? '' : ':' + ssl_port) + '/'
      json.appConfig.params.app_url = pfx + 'verify'
      json.appConfig.params.help_url = pfx + 'help.html'
      json.appConfig.params.public_key = pubkey
    }
    catch(e) {
      return error(e)
    }
    res.writeHead(200, {'Content-type': 'application/json'})
    res.write(' ')
    res.end(JSON.stringify(json))
  })
})

app.post('/verify', function(req, res) {
  res.writeHead(200, {'content-type': 'text/plain'});

  var v = vote.getById(req.body.vote)

  v.getResponse(function(err, txt) {
    if (!err) {
      res.write(txt)
    }
    res.end()
  })

})

app.get('/client.js', function(req, res) {
  require('browserify')().add('./client').bundle().pipe(res)
})


app.post('/votes', vote.add)
app.get('/votes', vote.list)
app.get('/elections', function(req, res) {
  function error(e) {
    res.writeHead(500)
    res.write(e.message)
    res.end()
  }

  fs.readFile('./config.json', function(err, json) {
    if (err) return  error(err)
    try {
      json = JSON.parse(json.toString('utf8'))
    }
    catch(e) {
      return error(e)
    }
    res.writeHead(200, {'Content-type': 'application/json'})
    res.end(JSON.stringify(json.appConfig.elections))
  })
  return
})


app.all('*', express.static('public'))

var sslOptions = {
  key: fs.readFileSync('ssl-key.pem'),
  cert: fs.readFileSync('ssl-cert.pem')
}

https.createServer(sslOptions, app).listen(ssl_port, function() {
  console.log('HTTPS server started at: https://' + domain.get() +
    (ssl_port === 443 ? '' : ':' + ssl_port) + '/'
  )
})
http.createServer(app).listen(http_port, function() {
  console.log('HTTP server started at: http://0.0.0.0:' + http_port + '/'
  )
})