function cpfname(){
  var cpf=$('#cpf').val();
  cpf="121.212.121-22";
  alert(cpf);
  // if (cpf.length<10) {

  $.get('/returnName/'+cpf, (name) => {
    $('#name').val()=name;
    alert(name);

  }).catch((error) => {
    console.log(error);
  });
// }
  }
