var qr = require('qr.js')


function showQR(vote) {
  var qrcode = qr(vote.msgId + '\n' + vote.electionId + '\t' + vote.hex)

  var width = 300;
  var height = 300;

  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  var ctx = canvas.getContext('2d');

  var cells = qrcode.modules;

  var tileW = width / cells.length;
  var tileH = height / cells.length;

  for (var r = 0; r < cells.length; ++r) {
    var row = cells[r];
    for (var c = 0; c < row.length; ++c) {
      ctx.fillStyle = row[c] ? '#000' : '#fff';
      var w = (Math.ceil((c + 1) * tileW) - Math.floor(c * tileW));
      var h = (Math.ceil((r + 1) * tileH) - Math.floor(r * tileH));
      ctx.fillRect(Math.round(c * tileW), Math.round(r * tileH), w, h);
    }
  }

  $('#qrModal .modal-content').empty().append(canvas)
  $('#qrModal').modal()

}

var voteTmpl
var addTmpl
function setup() {
  voteTmpl = $('.vote.tmpl').removeClass('tmpl').remove()

  $.ajax('/votes').done(function(votes) {
    votes.forEach(renderVote)
  })

  addTmpl = $('#addVote').remove()

  $.ajax('/elections').done(function(elections) {
    for (var i in elections) {
      addTmpl.find('#electionId').append(
        $('<option>', {value: i}).text(elections[i])
      )
    }
    $('#addBtn').on('click', newVote)
  })
}

function renderVote(v) {
  console.log('add')
  var el = voteTmpl.clone()

  el.find('[data-text=electionId]').text(v.electionId)
  el.find('[data-text=voterName]').text(v.voterName)
  el.find('[data-text=candidateNo]').text(v.candidateNo)
  el.find('[data-text=candidateName]').text(v.candidateName)
  el.find('[data-text=candidateParty]').text(v.candidateParty)
  el.find('.btn').on('click', function() {
    showQR(v)
  })
  $('.votes').append(el)
}

function newVote() {
  var modal = addTmpl.clone()
  $(document.body).append(modal)
  modal.modal()
  modal.on('hidden.bs.modal', function () {
    modal.remove()
  })
  console.log(modal.find('form').serialize())
  modal.find('#btnSave').on('click', function() {
    $.ajax({
      type: 'POST',
      data: modal.find('form').serialize(),
      url: '/votes',
      success: function(data) {
        renderVote(data)
        modal.modal('hide')
      }
    })

  })
}

$(setup)
