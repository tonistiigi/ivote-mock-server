var crypto = require('crypto')
var spawn = require('child_process').spawn
var concat = require('concat-stream')

function Vote(opt) {
  opt = opt || {}

  this.msgId = crypto.randomBytes(20)
  this.hex = crypto.randomBytes(20)

  this.version = opt.version || 1
  this.electionId = opt.electionId || 'ELECTIONID1'
  this.voterName = opt.voterName || 'First Last'
  this.voterCode = opt.voterCode || '01234567890'
  this.candidateNo = opt.candidateNo || '123'
  this.candidateName = opt.candidateName || 'Candi Date'
  this.candidateParty = opt.candidateParty || 'Party'
}

Vote.prototype.getResponse = function(cb) {
  var self = this
  getHash('./rsakey.pub', this.hex.toString('hex'),
    this.version + '\n' + this.electionId + '\n' + this.candidateNo + '\n',
    function(err, hash) {
      cb(err,  self.version + '\n0\n' + self.electionId + '\n' +
        self.electionId + '\t' + hash + '\n\n' + self.voterName + '\t' +
        self.voterCode + '\t\t' + self.candidateNo + '\t' +
        self.candidateName + '\t' + self.candidateParty)
    })

}

function getHash(keyfile, random, data, cb) {
  var java = spawn('java', ['-cp','.:bcprov-jdk14-146.jar', 'Encrypter',
    keyfile, random, data])
  var out
  java.stdout.pipe(concat(function(data) {
    out = data.toString().trim()
  }))
  java.on('close', function(code) {
    if (code) {
      cb(Error(code + out))
    }
    else {
      cb(null, out)
    }
  })
}

var votes = []

function add(req, res) {
  votes.push(new Vote(req.body))
  res.json({status: 'ok'})
}

function list(req, res) {
  res.json(votes.map(function(v) {
    return {
      electionId: v.electionId,
      voterName: v.voterName,
      msgId: v.msgId.toString('hex'),
      hex: v.hex.toString('hex')
    }
  }))
}

function getById(msgId) {
  msgId = msgId.toLowerCase()
  for (var i = 0; i < votes.length; i++) {
    if (votes[i].msgId.toString('hex') === msgId) {
      return votes[i]
    }
  }
}

exports.Vote = Vote
exports.add = add
exports.list = list
exports.getById = getById

