var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const auth = require('./middleware/auth');
const mongodb = require('../models/user');
const Client = require('../models/client');
const Equipament = require('../models/equipament');
const Rent = require('../models/rent');

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Entrar' });
});

/* POST login route */
router.post('/login', function(req, res, next) {
  const user = req.body.user;
  firebase.auth().signInWithEmailAndPassword(user.userName, user.password).then((userFirebase)=>{
    mongodb.getByUid(userFirebase.user.uid).then((result) => {
      req.session.logado = result;
      res.redirect('/home');
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/login')
  });
});

/* GET home page. */
router.get('/home', auth.isAuthenticated, function(req, res, next) {
  if(req.session.logado.type == 'Master') {
    res.render('homeMaster', { title: 'Home', ...req.session });
  }
  else {
    res.render('home', { title: 'Home' , ...req.session});
  }
});

/* POST Mirante route */
router.post('/dashboardMirante', auth.isAuthenticated, function(req, res, next) {
  req.session.unidade = "Mirante Bem-Ti-Vi";
  res.redirect(`/dashboard`);
});

/* POST Vila route */
router.post('/dashboardVila', auth.isAuthenticated, function(req, res, next) {
  req.session.unidade = "Vila Pampulha";
  res.redirect(`/dashboard`);
});

/* POST Matriz route */
router.post('/dashboardMatriz', auth.isAuthenticated, function(req, res, next) {
  req.session.unidade = "Matriz";
  res.redirect(`/dashboard`);
});

/* POST Contagem route */
router.post('/dashboardContagem', auth.isAuthenticated, function(req, res, next) {
  req.session.unidade = "Contagem";
  res.redirect(`/dashboard`);
});

/* GET Dashboard page */
router.get('/dashboard', auth.isAuthenticated, function(req, res, next) {
  var unity = req.session.unidade;
  Rent.getAllByStartLocal(unity).then((rents) => {
    if(req.session.logado.type == 'Master') {
      console.log(rents);
      res.render('dashboardMaster', { title: 'Dashboard Master', ...req.session, rents });
    }
    else {
      res.render('dashboard', { title: 'Dashboard', ...req.session, rents });
    }
  });
});

/* GET logout */
router.get('/logout', auth.isAuthenticated, function(req, res, next) {
  delete req.session.logado;
  delete req.session.unidade;
  firebase.auth().signOut().then(function(){});
    res.redirect(`/`);
});

/* GET signup */
router.get('/signup', auth.isAuthenticated, function(req, res, next) {
  res.render('signup', { title: 'Cadastro' });
});

/* POST signup */
router.post('/signup', auth.isAuthenticated, function(req,res) {
  const client  = req.body.client;
  Client.create(client).then((client_id) => {
    res.redirect(`/newRent`);
  }).catch((error) => {
    console.log(error);
    res.redirect('error');
  });
});

/* GET new Rent */
router.get('/newRent', auth.isAuthenticated, function(req, res, next) {
  res.render('newRent', { title: 'Novo Aluguel', ...req.session });
});

/* POST new Rent */
router.post('/newRent', auth.isAuthenticated, function(req, res, next) {
  const rent  = req.body.rent;
  var date = new Date();
  var hour = date.getHours();
  var minutes = date.getMinutes();
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  rent.year = date.getFullYear();
  rent.month = months[date.getMonth()];
  rent.day = date.getDate();
  rent.startTime = date.getTime();
  if (hour < "10") {
    hour = "0" + hour;
  }
  if (minutes < "10") {
    minutes = "0" + minutes;
  }
  rent.startHour = hour + ":" + minutes;
  rent.remainingQuantity = rent.quantity;
  Client.getByCpf(rent.cpf).then((client) => {
    rent.client = client;
    Equipament.getByName(rent.equipamentName).then((equipament) => {
      delete rent.equipamentName;
      rent.equipament = equipament;
      Rent.create(rent).then((rent) => {
        res.redirect('/dashboard');
      }).catch((error) => {
        console.log(error);
        res.redirect('error');
      });
    });    
  }).catch((error) => {
    console.log(error);
    res.redirect('error');
  });    
});

/* POST delete Rent */
router.post('/delete/:_id', auth.isAuthenticated, function(req, res, next) {
  const id = req.params._id;
  Rent.delete(id);
  res.redirect(`/dashboard`);
});

/* GET show Rent */
router.get('/show/:_id' , auth.isAuthenticated, function(req, res, next) {
  const id = req.params._id;
  Rent.getById(id).then((rent) => {
    var date = new Date();
    var now = date.getTime();
    var rentTime = Math.trunc((now - rent.startTime)/60000);
    var actualPrice = rent.quantity*rent.equipament.price*rentTime;
    var unitPrice = rent.equipament.price;
    unitPrice = unitPrice.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});;
    actualPrice = actualPrice.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    res.render('show', { title: 'Visualizar', ...req.session, rent, rentTime, actualPrice, unitPrice, now});
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET close Rent */
router.post('/close/:_id', function(req, res, next) {
  const id = req.params._id;
  const close = req.body.close;
  Rent.getById(id).then((rent) => {
    rent.endLocal = close.endLocal;
    rent.payment = close.payment;
    rent.remainingQuantity -= close.returnQuantity;
    if (rent.remainingQuantity == "0") {
      rent.status = "Finalizado";
    }
    var time = parseInt(close.rentTime);
    rent.receivedPrice += close.returnQuantity*rent.equipament.price*time;
    console.log(rent.receivedPrice);
    var date = new Date();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    if (hour < "10") {
      hour = "0" + hour;
    }
    if (minutes < "10") {
      minutes = "0" + minutes;
    }
    rent.endHour = hour + ":" + minutes;
    rent.endTime = date.getTime();

    Rent.update(id, rent).then((rent) => {
      res.redirect('/dashboard');
    });
  });
});

// router.get('/relatoriodiario',auth.isAuthenticated,auth.isMaster, function(req, res, next) {
//   var precott=0;
//   var tempott=0;
//   var today = new Date();
//   var dd= String(today.getDate());
//   var mm= String(today.getMonth()+1);
//   var yyyy = today.getFullYear();
//   const reldia = [];
//   // if(yd == dd){
//   Alugado.getAllByDay(dd,mm,yyyy).then((alugados) => {
// var cartao=0;
// var dinheiro=0;
//   for(var i = 0; i < alugados.length; i++) {
//     const alugadim = {
//       id: String,
//       horarioretirada: String,
//       eq: String,
//       horario_chegada: String,
//       _cpf: Number,
//       localsaida: String,
//       acess: String,
//       tempo: Number,
//       preco: Number,
//       pagamento: String,
//       nome: String
//     }

//     alugadim.nome = alugados[i].nome;
//     alugadim.id = alugados[i].id;
//     alugadim.horarioretirada = alugados[i].horarioretirada;
//     alugadim.eq= alugados[i].eq;
//     alugadim._cpf = alugados[i]._cpf;
//     alugadim.localsaida = alugados[i].localsaida;
//     alugadim.acess = alugados[i].acess;
//     alugadim.preco = alugados[i].preco;
//     alugadim.tempo = alugados[i].tempo;
//     alugadim.pagamento = alugados[i].pagamento;
//     reldia.push(alugadim);
//     if(alugadim.pagamento == "Cartao"){
//       cartao++;
//     }
//     else{
//       dinheiro++;
//     }
//     precott=precott+alugadim.preco;
//     tempott=tempott+alugadim.tempo;
//   }
//     console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
//     console.log(reldia);
//     console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
//     // console.log(reldia[0].localsaida);
//     console.log("ooooooooooooooooooooooooo");

// console.log(precott);
//   res.render('relatoriodiario', { title: 'Relatorio Diário', ...req.session,reldia , dd, mm, yyyy, precott, tempott, cartao, dinheiro });

// });

// });

// router.get('/relatoriomensal',auth.isAuthenticated, auth.isMaster, function(req, res, next) {
//   var today = new Date();
//   var mm= String(today.getMonth()+1);
//   var yyyy = today.getFullYear();
//   var quanttt=0;
//   var tempottm=0;
//   var precottm=0;
//   var dimtt=0;
//   var cartt=0;
// Alugado.getAllByMonth(mm,yyyy).then((result) => {
//   console.log("oooooooooo");
//   console.log(result);
//   for(var i=0;i<result.length;i++){
//   quanttt = quanttt + result[i].quantidade;
//     tempottm = tempottm + result[i].tempo;
//     precottm = precottm + result[i].preco;

//   dimtt =  dimtt + result[i].dinheiro;
//   cartt = cartt + result[i].cartao;
//   }
//   console.log("kkkkkkkkkkk");
//   console.log(precottm);
//   res.render('relatoriomensal', { title: 'Relatorio Mensal', ...req.session, result, mm, yyyy, quanttt, tempottm, dimtt, cartt, precottm });


// });
// });

// router.get('/relatorioporequipamento',auth.isAuthenticated, auth.isMaster, function(req, res, next) {
//   var today = new Date();
//   var mm= String(today.getMonth()+1);
//   var yyyy = today.getFullYear();
//   var quanttt=0;
//   var tempottm=0;
//   var precottm=0;
//   var dimtt=0;
//   var cartt=0;
// Alugado.getAllByMonth(mm,yyyy).then((result) => {
//   console.log("oooooooooo");
//   console.log(result);
//   for(var i=0;i<result.length;i++){
//   quanttt = quanttt + result[i].quantidade;
//     tempottm = tempottm + result[i].tempo;
//     precottm = precottm + result[i].preco;

//   dimtt =  dimtt + result[i].dinheiro;
//   cartt = cartt + result[i].cartao;
//   }
//   console.log("kkkkkkkkkkk");
//   console.log(precottm);
//   res.render('relatorioporequipamento', { title: 'Relatorio Por Equipamento', ...req.session, result, mm, yyyy, quanttt, tempottm, dimtt, cartt, precottm });


// });
// });

// router.get('/update/:aluguelid' ,auth.isAuthenticated, auth.isMaster, function(req, res, next){
//       const id = req.params.aluguelid;
//       Aluguel.getById(id).then((rent) => {
//         Client.getById(rent.client).then((client) => {
//           res.render('alterar', { title: 'Alterar', ...req.session, rent, client});
//         });        
//     });

// });

// router.post('/alteracao/:aluguelid' , function(req, res, next){
//     const aluguel = req.params.aluguelid;
//     const  alterado  = req.body.aluguel;
//     req.session.alterado = aluguel;
//     console.log(alterado);
//     console.log("kkkkkkkkkkkkkkkkkkkk");
//     Aluguel.getById(aluguel).then((result) => {
//     console.log(result);
//     var now= DateTime.local();
//     //
//     var string = result.horario_retirada;
//     // console.log(ola);
//     // console.log(resultado1);
//     result.horario_chegada = now;
//     console.log(alterado);
//     result.tempo = alterado.tempo;

//     Aluguel.update(aluguel,result);
//     console.log("lllllllllllllllllll");
//     console.log(result);
//       res.render('pagamento', { title: 'Pagamento', ...req.session, aluguel, result});
// });
// });


module.exports = router;
