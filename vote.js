
function Vote(opt) {
  opt = opt || {}
  this.version = opt.version || 1
  this.electionId = opt.electionId || 'ELECTIONID1'
  this.voterName = opt.voterName || 'First Last'
  this.voterCode = opt.voterCode || '01234567890'
  this.candidateNo = opt.candidateNo || '123'
  this.candidateName = opt.candidateName || 'Candi Date'
  this.candidateParty = opt.candidateParty || 'Party'
}

Vote.prototype.getResponse = function() {
  return this.version + '\n0\n' + this.electionId + '\n' + this.electionId +
    '\t' + 'abc' + '\n\n' + this.voterName + '\t' + this.voterCode +
    '\t\t' + this.candidateNo + '\t' + this.candidateName + '\t' +
    this.candidateParty
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
      voterName: v.voterName
    }
  }))
}

exports.Vote = Vote
exports.add = add
exports.list = list