
$(document).ready(() => {

  console.log("kkkkkkkkkkkkkkkkk");
  setInterval(function(){
  $.post('/tempo', {}, (horarios) => {
    var body;

  for(var i = 0; i < horarios.length; i++) {
          body +=   `   <td scope="row" class="text-center align-middle font-weight-bold">${horarios[i].tempo} min </td>`;
          console.log(horarios[i].tempo);
      }
      $('#horarios').html(body);
    });
    }, 3000);
});
