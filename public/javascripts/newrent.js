function cpfname() {
  var cpf = $('#cpf').val();
  //cpf="121.212.121-22";
  //alert(cpf);
  if (cpf.length == 14) {
    $.get('/returnName/' + cpf, (name) => {
      $('#name').val(name);
      //alert(name);
    }).catch((error) => {
      console.log(error);
    });
  }
  else {
    $('#name').val("");
  }
}
function partialPrice() {
  var id = $('#_id');
  var text = id.text().split(":  ");
  var _id = text[1];
  var quantity = $('#quantity').val();
  $.get('/partialPrice/' + _id, (partialPrice) => {
    var loyaltyPoints = $('#_loyaltyPoints');
    var loyalty = loyaltyPoints.text().split(":  ");
    var _loyaltyPoints = Number(loyalty[1]);
    var totalTime = partialPrice.rentTime * quantity;
    var time = `<b>Tempo de aluguel:</b> ${partialPrice.rentTime} minutos`;
    $('#time').html(time);
    if(_loyaltyPoints == 10) {
      totalTime -= 60;
    }
    if(totalTime < 0){
      totalTime = 0;
    }
    var price = partialPrice.price * totalTime;
    if(partialPrice.name == "Kit de Segurança" || partialPrice.name == "Capacete") {
      price = 5 * quantity;
      partialPrice.priceEquipament = price;
    }
    price = price.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    $('#price').val(price);
  }).catch((error) => {
    console.log(error);
  });
  setTimeout('partialPrice()', 1000);
}