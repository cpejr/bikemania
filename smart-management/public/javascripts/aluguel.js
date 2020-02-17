function time()
{
    today=new Date();
    h=today.getHours()+1;
    m=today.getMinutes();
    document.getElementById('txt').innerHTML=h+":"+m;
    setTimeout('time()',500);
}

document
    .getElementById("confirmClickActionElementId")
    .addEventListener("click", function( e ){ //e => event
        if( ! confirm("Tem certeza que deseja excluir este aluguel?") ){
            e.preventDefault(); // ! => don't want to do this
        } else {
            //want to do this! => maybe do something about it?
            alert('Aluguel cancelado');
        }
    });
