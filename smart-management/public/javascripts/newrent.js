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
 

  console.log(text);
  var _id = text[1];
  
  var quantity = $('#quantity').val();
  console.log(_id);
  console.log(quantity);
  
  $.get('/partialPrice/' + _id, (partialPrice) => {
    console.log(partialPrice);
    alert(partialPrice);
    // partialPrice *= quantity;
    // console.log("FOI::");
    // console.log(partialPrice);


    $('#price').val(partialPrice);
  });
  // setTimeout('partialPrice()', 10000);
}