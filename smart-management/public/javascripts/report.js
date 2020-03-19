function tablereport() {
    let tableBody = '';
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var aux = $('#date').text().split("- ");
    var date = aux[1].split("/");
    var monthNumber = Number(date[0]);
    var yearNumber = Number(date[1]);
    var daysNumber;
    var monthText = months[monthNumber-1];


    // if ((monthNumber == 1 || monthNumber == 3 || monthNumber == 5 || monthNumber == 7 || monthNumber == 8 || monthNumber == 10 || monthNumber == 12)) {
    //     daysNumber = 31;
    // }
    // else if ((monthNumber == 4 || monthNumber == 6 || monthNumber == 9 || monthNumber == 11)) {
    //     daysNumber = 30;
    // }
    // else if (monthNumber == 2 && ((yearNumber % 4 == 0) && ((yearNumber % 100 != 0) || (yearNumber % 400 == 0)))) {
    //     daysNumber = 29;

    // }
    // else if (monthNumber == 2 && !((yearNumber % 4 == 0) && ((yearNumber % 100 != 0) || (yearNumber % 400 == 0)))) {
    //     daysNumber = 28;
    // }
    // console.log("DaysNumber");

    // console.log(daysNumber);
    // for (var auxday = 1; auxday <= daysNumber; auxday++) {
        var texturl = ':' + monthText + ':' + yearNumber +":"+"Bem-Te-Vi";
        $.get('/getdailyBalance/' + texturl, (rents) =>{
            console.log(rents);
            
        });
            // tableBody += `<tr><td>${auxday} / ${monthNumber} / ${yearNumber}</td><td>${send.Units}</td><td>${send.Profit}</td></tr>`;
        // }); 
    // }
    $('#table-body').html(tableBody);




}