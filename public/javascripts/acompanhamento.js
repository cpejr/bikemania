
$(document).ready(() => {
  setInterval(function(){
  $.post('/tempo', {}, (horarios) => {
    var body;
    for(var i = 0; i < horarios.length; i++) {
      body +=   `   <td scope="row" class="text-center align-middle font-weight-bold">${horarios[i].tempo} min </td>`;
      }
      $('#horarios').html(body);
    });
  }, 3000);
});
