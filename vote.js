
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


exports.Vote = Vote