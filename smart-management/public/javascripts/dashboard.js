function button(){
    var status = $('#status').text();
    console.log(status);
    if(status == "Aguardando pagamento"){
        $('#showbutton').hide();
    }
}