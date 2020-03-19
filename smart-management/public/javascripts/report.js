function tablereport() {
    let tableBody = '';
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var aux = $('#date').text().split("- ");
    var unidade = $('#unidade').text();
    var date = aux[1].split("/");
    var monthNumber = Number(date[0]);
    var yearNumber = Number(date[1]);
    var monthText = months[monthNumber-1];
        var texturl = ':' + monthText + ':' + yearNumber +":"+ unidade;
        $.get('/getdailyBalance/' + texturl, (rents) =>{
            console.log(rents);
            var length = rents.day.length;
            console.log(length);
            console.log(rents.day[0]);
            console.log(rents.Units[0]);
            console.log(rents.Profit[0]);


            
            

            for(var i=0 ; i<length ; i++){
                var ProfitR$ = rents.Profit[i].toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                tableBody += `<tr><td>${rents.day[i]} / ${monthNumber} / ${yearNumber}</td><td>${rents.Units[i]}</td><td>${ProfitR$}</td></tr>`;

                
            }
            
    
            $('#table-body').html(tableBody);
            
        });
            // tableBody += `<tr><td>${auxday} / ${monthNumber} / ${yearNumber}</td><td>${send.Units}</td><td>${send.Profit}</td></tr>`;
        // }); 
    // }





}