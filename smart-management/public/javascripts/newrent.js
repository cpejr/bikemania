function cpfname(){
  var cpf=$('#cpf').val();
  //cpf="121.212.121-22";
  //alert(cpf);

   if (cpf.length==14) {

  $.get('/returnName/'+cpf, (name) => {
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

 function partialPrice(_id){
   var partialPrice=$('#price').val();
   var quantidade=$('#Quantidade').val();
   $.get('/partialPrice/'+_id, (price) => {
     price=price*quantidade;
     $('#price').val(price);
 }
