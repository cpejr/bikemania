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
  var text = id.text().split(":  ");;
  var _id = text[1];

  var quantity = $('#quantity').val();
  $.get('/partialPrice/' + _id, (partialPrice) => {
    var totalTime = partialPrice.rentTime * quantity;
    var price = partialPrice.price * totalTime;
    price = price.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    $('#price').val(price);
  }).catch((error) => {
    console.log(error);
  });
  setTimeout('partialPrice()', 1000);
}

