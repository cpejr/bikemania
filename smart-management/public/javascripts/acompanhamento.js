
$(document).ready(() => {

  console.log("kkkkkkkkkkkkkkkkk");
  setInterval(function(){
  $.post('/tempo', {}, (horarios) => {
    var body;

  for(var i = 0; i < horarios.length; i++) {
          body +=   `  <tr>
              <td scope="row" class="text-center align-middle font-weight-bold"></td>

          <td scope="row" class="text-center align-middle font-weight-bold">${horarios[i].tempo} min </td>
          <td scope="row" class="text-center align-middle font-weight-bold"></td>
          <td scope="row" class="text-center">
            <form action="/pagamento/{{id}}" method="get">
            <button class="btn text-white orange-button" type="submit">Encerrar</button>
          </form>
          </td>
          </tr>`;
          console.log(horarios[i].tempo);
      }
      body += `</tbody>
            </table>`;
      $('#horarios').html(body);
    });
    }, 3000);
});
