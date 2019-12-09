$(document).ready(() => {
  console.log("kkkkkkkkkkkkkkkkk");
  $.post('/index/tempo', {}, (horarios) => {
    console.log(horarios);
    setInterval(function(){
      for(let i=0; i<horarios.length; i++){
        var string = horarios.horarioretirada;
        var ola = new Date(string);
        let minutes =  0;
          minutes += parseFloat(Interval.fromDateTimes(ola, now).length('minutes').toFixed(2));
            body =   `<td scope="row" class="text-center align-middle font-weight-bold">${minutes} min </td>`;
      }
      $('#horarios').html(body);
       }, 3000);
    });
});
