function time()
{
    today=new Date();
    h=today.getHours()+1;
    m=today.getMinutes();
    document.getElementById('txt').innerHTML=h+":"+m;
    setTimeout('time()',500);
}