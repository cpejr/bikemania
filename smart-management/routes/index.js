var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const auth = require('./middleware/auth');
const mongo = require('../models/user');
// var datetime = require('node-datetime');
const { DateTime } = require('luxon');
const { Interval } = require('luxon');
const Client = require('../models/client');
const Aluguel = require('../models/aluguel');
const Alugado = require('../models/alugado');
const Preco = require('../models/preco');

// var Timer  = require('lib/easytimer/dist/easytimer.min.js');
// var dd= String(today.getDate()).pad.Start(2,'0');
// var mm= String(today.getMonth()+ 1).pad.Start(2,'0');
// var yyyy = today.getFullYear();
// var today= new Date();
// var hours = today.getHours();
// var minutes = today.getMinutes();
// var scnds = today.getSeconds();

/* GET home page. */
router.get('/home',auth.isAuthenticated, function(req, res, next) {
    res.render('home', { title: 'Home' , ...req.session});
});
router.get('/login2', function(req, res, next) {
  res.render('acmpteste', { title: 'Login' });
});
router.get('/signup',auth.isAuthenticated, function(req, res, next) {
  res.render('signup', { title: 'Cadastro' });
});
/*POST signup*/
router.post('/signup',(req,res) => {
  const  client  = req.body.client;
    Client.create(client).then((client_id) => {
      console.log("entrou");
      console.log(client_id);
      console.log(client);
      res.redirect(`/novoaluguel`);
    }).catch((error) => {
      console.log(error);
      res.redirect('error');
    });

});
router.get('/homemaster',auth.isAuthenticated, function(req, res, next) {
    res.render('homemaster', { title: 'Home', ...req.session });
});
router.get('/login', function(req, res, next) {
  res.render('index', { title: 'Login' });
});
router.get('/novoaluguel',auth.isAuthenticated, function(req, res, next) {
  res.render('novoaluguel', { title: 'Novo Aluguel', ...req.session });
});
router.get('/relatoriodiario',auth.isAuthenticated,auth.isMaster, function(req, res, next) {
  var precott=0;
  var tempott=0;
  var today = new Date();
  var dd= String(today.getDate());
  var mm= String(today.getMonth()+1);
  var yyyy = today.getFullYear();
  const reldia = [];
  // if(yd == dd){
  Alugado.getAllByDay(dd,mm,yyyy).then((alugados) => {
var cartao=0;
var dinheiro=0;
  for(var i = 0; i < alugados.length; i++) {
    const alugadim = {
      id: String,
      horarioretirada: String,
      eq: String,
      horario_chegada: String,
      _cpf: Number,
      localsaida: String,
      acess: String,
      tempo: Number,
      preco: Number,
      pagamento: String,
      nome: String
    }

    alugadim.nome = alugados[i].nome;
    alugadim.id = alugados[i].id;
    alugadim.horarioretirada = alugados[i].horarioretirada;
    alugadim.eq= alugados[i].eq;
    alugadim._cpf = alugados[i]._cpf;
    alugadim.localsaida = alugados[i].localsaida;
    alugadim.acess = alugados[i].acess;
    alugadim.preco = alugados[i].preco;
    alugadim.tempo = alugados[i].tempo;
    alugadim.pagamento = alugados[i].pagamento;
    reldia.push(alugadim);
    if(alugadim.pagamento == "Cartao"){
      cartao++;
    }
    else{
      dinheiro++;
    }
    precott=precott+alugadim.preco;
    tempott=tempott+alugadim.tempo;
  }
    console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    console.log(reldia);
    console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
    // console.log(reldia[0].localsaida);
    console.log("ooooooooooooooooooooooooo");

console.log(precott);
  res.render('relatoriodiario', { title: 'Relatorio Diário', ...req.session,reldia , dd, mm, yyyy, precott, tempott, cartao, dinheiro });

});

});


router.get('/relatoriomensal',auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  var today = new Date();
  var mm= String(today.getMonth()+1);
  var yyyy = today.getFullYear();
  var quanttt=0;
  var tempottm=0;
  var precottm=0;
  var dimtt=0;
  var cartt=0;
Alugado.getAllByMonth(mm,yyyy).then((result) => {
  console.log("oooooooooo");
  console.log(result);
  for(var i=0;i<result.length;i++){
  quanttt = quanttt + result[i].quantidade;
    tempottm = tempottm + result[i].tempo;
    precottm = precottm + result[i].preco;
  dimtt =  dimtt + result[i].dinheiro;
  cartt = cartt + result[i].cartao;
  }
  console.log("kkkkkkkkkkk");
  console.log(precottm);
  res.render('relatoriomensal', { title: 'Relatorio Mensal', ...req.session, result, mm, yyyy, quanttt, tempottm, dimtt, cartt, precottm });


});
});

router.post('/novoaluguel', function(req, res, next) {
  const  aluguel  = req.body.aluguel;
  aluguel.local_saida=req.session.unidade;
  var nome  ;
  var saida= DateTime.local();
 aluguel.horario_retirada = saida;
 console.log(aluguel.horario_retirada);
console.log(nome);
Client.getByCpf(aluguel.cpf).then((client) => {
  // aluguel.client = client;
  // console.log("entrouprimeirosgdh");
  aluguel.nome = client.name;
  Aluguel.create(aluguel).then((aluguel_id) => {

    console.log("entrou");
    console.log(aluguel_id);
    console.log("-------------------------------------------------------------");
    console.log(aluguel);

  }).catch((error) => {
    console.log(error);
    res.redirect('error');
  });
}).catch((error) => {
  console.log(error);
  res.redirect('error');
});



    if(req.session.logado.type=='Master'){
      res.redirect('/acompmaster');
  //    res.render('acompmaster', { title: 'master' , ...nome});
    }
  else{
    res.redirect('/acompanhamento');
    //res.render('acompanhamento', { title: 'normal' , ...nome});
  }
});

router.post('/login', function(req, res, next) {
  const user=req.body.user;
  firebase.auth().signInWithEmailAndPassword(user.username, user.password).then((userF)=>{
    mongo.getByUid(userF.user.uid).then((result)=> {
      req.session.logado=result;
    if(req.session.logado.type=='Master'){
        res.redirect('/homemaster')
      }
      else{
         res.redirect('/home')
      }
    }).catch((error)=>{
      console.log(error);
      res.redirect('/error')
      });
    }).catch((error)=>{
      console.log(error);
      res.redirect('/error')
      });
  });


router.get('/acompanhamento', auth.isAuthenticated, function(req, res, next) {
  const teste = [];
  var logado = req.session.unidade;
  var nome = new Array;
   // var now= DateTime.local();

  Aluguel.getAll().then((alugueis) => {
    var j=0;

  for(var i = 0; i < alugueis.length; i++) {
    const locaisInfo = {
      id: String,
      horarioretirada: String,
      eq: String,
      // horario_chegada: String,
      // _cpf: Number,
     // localsaida: String,
      // acess: String,
      nome: String,
      hora: Number,
      minute:Number
      // preco: Number
    }

    if(alugueis[i].local_saida == logado){
    locaisInfo.nome = alugueis[i].nome;
    locaisInfo.id = alugueis[i]._id;
    locaisInfo.horarioretirada = alugueis[i].horario_retirada;
    locaisInfo.eq= alugueis[i].equipamento;
    locaisInfo._cpf = alugueis[i].cpf;
    locaisInfo.localsaida = alugueis[i].local_saida;
    locaisInfo.acess = alugueis[i].acessorio;
    var now= DateTime.local();
  console.log("kkkkkkkkkkkkkkkkkkkkkkkkk");
console.log(now);
console.log("wwwwwwwwwwwwwwwwwwww");
var string = alugueis[i].horario_retirada;

// var resultado2 = string.substring()
var ola = new Date(string);
console.log(ola);

// var intervalo=Interval.fromDateTimes(ola, now);

let minutes =  0;
  minutes += parseFloat(Interval.fromDateTimes(ola, now).length('minutes').toFixed(2));
   console.log(minutes);
   locaisInfo.tempo = minutes;
   let minute = parseInt(minutes % 60,10);
   if( minute < 10){
     minute = '0' + minute;
   }
   let hour = parseInt((minutes - minute) / 60, 10);
   if(hour < 10) {
     hour = '0' + hour;
   }
   locaisInfo.hora = hour;
   locaisInfo.minute = minute;
//    console.log(locaisInfo.tempo);
console.log(hour);
    teste.push(locaisInfo);

  }

  }
  console.log('--------------');
  console.log(teste);
  res.render('acompanhamento', { title: 'Acompanhamento', ...req.session,teste,nome });
  });
});
router.post('/tempo',(req, res) => {
  const teste = [];
  var logado = req.session.unidade;
  var nome = new Array;
   // var now= DateTime.local();
// setInterval(function(){

  Aluguel.getAll().then((alugueis) => {
    var j=0;
// setInterval(function(){

  for(var i = 0; i < alugueis.length; i++) {
    const locaisInfo = {
      tempo: Number,
      horarioretirada: String
    }
console.log(logado);
console.log("r");
// console.log(alugueis[i].local_saida);
    if(alugueis[i].local_saida == logado){
    locaisInfo.horarioretirada = alugueis[i].horario_retirada;
    console.log("rrrrrrrrrrrrrrr");

    // locaisInfo._cpf = alugueis[i].cpf;
    // locaisInfo.localsaida = alugueis[i].local_saida;
    // locaisInfo.acess = alugueis[i].acessorio;
     var now= DateTime.local();
//   console.log("kkkkkkkkkkkkkkkkkkkkkkkkk");
// console.log(now);
// console.log("wwwwwwwwwwwwwwwwwwww");
// var string = alugueis[i].horario_retirada;
  var string = locaisInfo.horarioretirada;
  var ola = new Date(string);
  let minutes =  0;
    minutes += parseFloat(Interval.fromDateTimes(ola, now).length('minutes').toFixed(2));
    locaisInfo.tempo = minutes;
  teste.push(locaisInfo);
  console.log("wwwwwwwwwwwwwwwwwwww");

  console.log(locaisInfo);
// var resultado2 = string.substring()
// var ola = new Date(string);
// console.log(ola);
}
}
res.send(teste);
});
});
router.get('/acompmaster', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const teste = [];
  var logado = req.session.unidade;
  var nome = new Array;
  Aluguel.getAll().then((alugueis) => {
    var j=0;

  for(var i = 0; i < alugueis.length; i++) {
    const locaisInfo = {
      id: String,
      horarioretirada: String,
      eq: String,
      horario_chegada: String,
      _cpf: Number,
      localsaida: String,
      acess: String,
      nome: String
    }

    if(alugueis[i].local_saida == logado){
    locaisInfo.nome = alugueis[i].nome;
    locaisInfo.id = alugueis[i]._id;
    locaisInfo.horarioretirada = alugueis[i].horario_retirada;
    locaisInfo.eq= alugueis[i].equipamento;
    locaisInfo._cpf = alugueis[i].cpf;
    locaisInfo.localsaida = alugueis[i].local_saida;
    locaisInfo.acess = alugueis[i].acessorio;
    var now= DateTime.local();
  console.log("kkkkkkkkkkkkkkkkkkkkkkkkk");
console.log(now);
console.log("wwwwwwwwwwwwwwwwwwww");
var string = alugueis[i].horario_retirada;

// var resultado2 = string.substring()
var ola = new Date(string);
console.log(ola);

// var intervalo=Interval.fromDateTimes(ola, now);

// locaisInfo.tempo = intervalo.toString();
let minutes =  0;
  minutes += parseFloat(Interval.fromDateTimes(ola, now).length('minutes').toFixed(2));
  console.log(minutes);
  locaisInfo.tempo = minutes;
   console.log(locaisInfo.tempo);
    teste.push(locaisInfo);
  }

  }
  console.log('--------------');
  console.log(teste);
  res.render('acompmaster', { title: 'Acompanhamento Master', ...req.session,teste,nome });
  });
});
router.post('/acompmirante', function(req, res, next) {
   req.session.unidade="Mirante";
   console.log(req.session.unidade);
   if(req.session.logado.type == "Master"){
       res.redirect(`/acompmaster`);
     }
     else{
       res.redirect(`/acompanhamento`);
     }
     });

router.post('/acompmatriz', function(req, res, next) {
  req.session.unidade="Matriz";
  if(req.session.logado.type == "Master"){
      res.redirect(`/acompmaster`);
    }
    else{
      res.redirect(`/acompanhamento`);
    }
         });

 router.post('/cancelar/:locais_id', function(req, res, next) {
    const locais = req.params.locais_id;
    Aluguel.delete(locais);
    res.redirect(`/acompmaster`);
             });
    var reldia = [];
    router.get('/pagamento/:aluguelid' , function(req, res, next){
        const aluguel = req.params.aluguelid;

        Aluguel.getById(aluguel).then((result) => {
        console.log(result);
        var now= DateTime.local();
        //
        var string = result.horario_retirada;
         var resultado1 = string.substring(0,10);
        var ola = new Date(string);
        // console.log(ola);
        // console.log(resultado1);
        result.horario_chegada = now;
        let minutes =  0;
         minutes += parseFloat(Interval.fromDateTimes(ola, now).length('minutes').toFixed(2));
         result.tempo = minutes;
         let minute = parseInt(minutes % 60,10);
         if( minute < 10){
           minute = '0' + minute;
         }
         let hour = parseInt((minutes - minute) / 60, 10);
         if(hour < 10) {
           hour = '0' + hour;
         }
         result.hora = hour;
         result.minute = minute;
         console.log("rrrrrrrrrrrrrrrrrrrr");
         console.log(result.equipamento);
         Preco.getByEq(result.equipamento).then((res) => {
           console.log("tttttttttttttttttttt");
           console.log(res.preco);
           console.log("ffffffffffffff");
           console.log(result.tempo);
            result.preco = (result.tempo/60) *res.preco;
            Aluguel.update(aluguel,result);

          }).catch((error)=>{
            console.log(error);
            res.redirect('/error')
            });
            console.log(result);
            res.render('pagamento', { title: 'Pagamento', ...req.session, aluguel, result});
          }).catch((error)=>{
            console.log(error);
            res.redirect('/error')
            });
});
router.post('/encerrar/:locais_id', function(req, res, next) {
    const locais = req.params.locais_id;
    const  alugado  = req.body.alugado;
    console.log("rrrrrrrrrrrr");
console.log(alugado);
    Aluguel.getById(locais).then((result) => {
      console.log("ooooooooooooo");
      console.log(result);
      const alugados = {
        id: String,
        horarioretirada: String,
        eq: String,
        horariochegada: String,
        _cpf: Number,
        localsaida: String,
        acess: String,
        tempo: Number,
        preco: Number,
        dia: Number,
        mes: Number,
        ano: Number,
        nome: String,
        pagamento: String

      }

        var today = new Date();
      var dd= String(today.getDate());
      var mm= String(today.getMonth()+1);
      var yyyy = today.getFullYear();
      alugados.pagamento = req.body.alugado.pagamento;
      alugados.horarioretirada = result.horario_retirada;
      alugados.horariochegada= result.horario_chegada;
      alugados.eq= result.equipamento;
      alugados._cpf = result.cpf;
      alugados.localsaida = result.local_saida;
      alugados.acess = result.acessorio;
      alugados.preco = result.preco;
      alugados.tempo = result.tempo;
      alugados.nome = result.nome;
      alugados.dia = dd;
      alugados.mes = mm;
      alugados.ano = yyyy;
      console.log("kkkkkkkkkkkk");
      console.log(alugados);
      Alugado.create(alugados).then((alugado_id) => {
        console.log("eeeeeeeeeeeeeeeee");
        console.log(alugado_id);
      });
    // reldia.push(result);
    // console.log("heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeey");
    // console.log(reldia);
    // console.log("heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeey");
    });

    Aluguel.delete(locais);
if(req.session.logado.type == "Master"){
  res.redirect('/acompmaster');
}
else{
  res.redirect('/acompanhamento');
}
            });
router.get('/update/:aluguelid' ,auth.isAuthenticated, function(req, res, next){
      const id = req.params.aluguelid;
      Aluguel.getById(id).then((result) => {
      res.render('alterar', { title: 'Alterar', ...req.session, result, id});
    });

});
router.post('/alteracao/:aluguelid' , function(req, res, next){
    const aluguel = req.params.aluguelid;
    const  alterado  = req.body.aluguel;
    req.session.alterado = aluguel;
    console.log(alterado);
    console.log("kkkkkkkkkkkkkkkkkkkk");
    Aluguel.getById(aluguel).then((result) => {
    console.log(result);
    var now= DateTime.local();
    //
    var string = result.horario_retirada;
    // console.log(ola);
    // console.log(resultado1);
    result.horario_chegada = now;
    console.log(alterado);
    result.tempo = alterado.tempo;

    Aluguel.update(aluguel,result);
    console.log("lllllllllllllllllll");
    console.log(result);
      res.render('pagamento', { title: 'Pagamento', ...req.session, aluguel, result});
});
});
router.post('/acompvila', function(req, res, next) {
  req.session.unidade="Vila";
  console.log(req.session.unidade);
  if(req.session.logado.type == "Master"){
      res.redirect(`/acompmaster`);
    }
    else{
      res.redirect(`/acompanhamento`);
    }
          });
router.post('/voltar', function(req, res, next) {
    if(req.session.logado.type == "Master"){
        res.render('homemaster', { title: 'Home Master', ...req.session, reldia });
    }
    else{
        res.render('home', { title: 'Home', ...req.session, reldia });
    }
    res.redirect(`/acompanhamento`);
          });
          router.post('/deslog', function(req, res, next) {
            firebase.auth().signOut().then(function(){});
              user = null;
              req.session.logado= null;
              res.redirect(`/login`);
                     });


module.exports = router;
