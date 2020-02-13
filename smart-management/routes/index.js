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
  firebase.auth().signInWithEmailAndPassword(user.userName, user.password).then((userFirebase) => {
    mongodb.getByUid(userFirebase.user.uid).then((result) => {
      req.session.logado = result;
      res.redirect('/home');
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    switch (error.code) {
       case 'auth/wrong-password':
         req.flash('danger', 'Senha incorreta.');
         break;
       case 'auth/user-not-found':
         req.flash('danger', 'Email não cadastrado.');
         break;
       case 'auth/network-request-failed':
         req.flash('danger', 'Falha na internet. Verifique sua conexão de rede.');
         break;
       default:
         req.flash('danger', 'Erro indefinido.');
         console.log(error.code)
       }
     console.log(`Error Code: ${error.code}`);
     console.log(`Error Message: ${error.message}`);
     res.redirect('/');
  });
});

router.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword', {title:'Esqueci Minha Senha'});
});

router.post('/forgotPassword', (req, res) => {
  console.log(req.body);
  const emailAddress = req.body.user.userName;
  console.log(emailAddress);
  firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
    res.redirect('/');
    req.flash('success', 'Email enviado');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
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
  req.session.unidade = "Shopping Contagem";
  res.redirect(`/dashboard`);
});

/* GET Dashboard page */
router.get('/dashboard', auth.isAuthenticated, function(req, res, next) {
  var unity = req.session.unidade;
  Rent.getAllByStartLocal(unity).then((rents) => {
    if(req.session.logado.type == 'Master') {
      res.render('dashboardMaster', { title: 'Dashboard Master', ...req.session, rents });
    }
    else {
      res.render('dashboard', { title: 'Dashboard', ...req.session, rents });
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET logout */
router.get('/logout', auth.isAuthenticated, function(req, res, next) {
  delete req.session.logado;
  delete req.session.unidade;
  firebase.auth().signOut().then(function(){
    res.redirect(`/`);
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET signup */
router.get('/signup', auth.isAuthenticated, function(req, res, next) {
  res.render('signup', { title: 'Cadastro' });
});

/* POST signup */
router.post('/signup', auth.isAuthenticated, function(req,res) {
  const client  = req.body.client;
  var text = "/newRent/" + client.cpf;
  Client.create(client).then((client_id) => {
    res.redirect(text);
  }).catch((error) => {
    console.log(error);
    switch (error.code) {
      case 11000:
      if(error.keyPattern.cpf) {
          req.flash('danger', 'CPF inserido já está em uso'); }
      else if(error.keyPattern.rg) {
          req.flash('danger', 'RG inserido já está em uso'); }
        break;
    }
    res.redirect('/signup');
  });
});

/* GET new Rent with CPF*/
router.get('/newRent/:cpf', auth.isAuthenticated, function(req, res, next) {
  var cpf = req.params.cpf;
  res.render('newRent', { title: 'Novo Aluguel', ...req.session, cpf });
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
    rent.quantity = parseInt(rent.quantity);
    client.equipamentRents = parseInt(client.equipamentRents);
    client.equipamentRents += rent.quantity;
    client.points = parseInt(client.points);
    client.points += rent.quantity;
    var clientId = client._id;

    if (client.points > 9) {
      client.points -= 10;
      rent.sale = "Ativado";
    }

    Client.update(clientId, client).then(() => {
      Equipament.getByName(rent.equipamentName).then((equipament) => {
        delete rent.equipamentName;
        rent.equipament = equipament;
        Rent.create(rent).then((rent) => {
          res.redirect('/dashboard');
        }).catch((error) => {
          console.log(error);
          res.redirect('error');
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error')
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('error');
    });
  }).catch((error) => {
    req.flash('danger',"CPF não cadastrado");
    console.log(error);
    res.redirect('/newRent');
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
    var sale = 1;
    var date = new Date();
    var now = date.getTime();
    var rentTime = Math.trunc((now - rent.startTime)/60000);
    if(rent.sale == "Ativado") {
      sale = 0.5;
    }
    var actualPrice = rent.quantity*rent.equipament.price*rentTime*sale;
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
    var sale = 1;
    if (rent.sale == "Ativado") {
      sale = 0.5;
    }
    rent.endLocal = close.endLocal;
    rent.payment = close.payment;
    rent.remainingQuantity -= close.returnQuantity;
    if (rent.remainingQuantity === 0) {
      rent.status = "Finalizado";
    }
    var time = parseInt(close.rentTime);
    rent.receivedPrice += close.returnQuantity*rent.equipament.price*time*sale;
    var date = new Date();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    if (hour < "10") {
      hour = "0" + hour;
    }
    if (minutes < "10") {
      minutes = "0" + minutes;
    }
    rent.discount = rent.receivedPrice;
    rent.hasDiscount = close.hasDiscount;
    rent.justification = close.justification;
    rent.endHour = hour + ":" + minutes;
    rent.endTime = date.getTime();
    rent.totalTime = Math.trunc((rent.endTime - rent.startTime)/60000);
    console.log(rent);

    Rent.update(id, rent).then((rent) => {
      res.redirect('/dashboard');
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});


/* GET close Rent */
router.post('/dailyReport/edit/:_id', function(req, res, next) {
  const id = req.params._id;
  const price = req.body.price;
  console.log("Atualizando");
  Rent.getById(id).then((rent) => {
    console.log(id);
    console.log(rent);
    rent.discount = price;
    Rent.update(id, rent).then((rent) => {
      res.redirect('/dailyReport');
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});


/* GET dailyBalance */
router.get('/dailyBalance', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const id = req.params._id;
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = new Date();
  var date = {
    year: date.getFullYear(),
    month:   months[date.getMonth()],
    monthNumber: (date.getMonth()+1),
    hour: date.getHours(),
    day: date.getDate()
  }
  req.session.date = date;
  Rent.getAllByDate(date.day, date.month, date.year).then((rents) => {
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.discount, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByDateAndEndLocal("Matriz", date.day, date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.discount, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByDateAndEndLocal("Mirante Bem-Ti-Vi", date.day, date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByDateAndEndLocal("Vila Pampulha", date.day, date.month,date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByDateAndEndLocal("Shopping Contagem", date.day, date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            totalProfit = totalProfit.toFixed(2);
            matrizProfit = matrizProfit.toFixed(2);
            miranteProfit = miranteProfit.toFixed(2);
            vilaProfit = vilaProfit.toFixed(2);
            contagemProfit = contagemProfit.toFixed(2);
            res.render('dailyBalance', { title: 'Info', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date });
          }).catch((error) => {
            console.log(error);
            res.redirect('/error')
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error')
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error')
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

router.get('/dailyBalance/:day::month::year', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  var date = {
    day: Number(req.params.day),
    monthNumber: Number(req.params.month),
    year: Number(req.params.year)
  }
  console.log(date);
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = new Date();
  var newdate = {
    year: date.getFullYear(),
    month:   months[date.getMonth()],
    monthNumber: (date.getMonth()+1),
    hour: date.getHours(),
    day: Number(date.getDate())
  }
  console.log(newdate);
  if(newdate.day && date.day){
    console.log("aqui");
  }
  req.session.date = date;
  Rent.getAllByDate(date.day, date.month, date.year).then((rents) => {
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.discount, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByDateAndEndLocal("Matriz", date.day, date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.discount, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByDateAndEndLocal("Mirante Bem-Ti-Vi", date.day, date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByDateAndEndLocal("Vila Pampulha", date.day, date.month,date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByDateAndEndLocal("Shopping Contagem", date.day, date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            totalProfit = totalProfit.toFixed(2);
            matrizProfit = matrizProfit.toFixed(2);
            miranteProfit = miranteProfit.toFixed(2);
            vilaProfit = vilaProfit.toFixed(2);
            contagemProfit = contagemProfit.toFixed(2);
            res.render('dailyBalance', { title: 'Info', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date });
          }).catch((error) => {
            console.log(error);
            res.redirect('/error')
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error')
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error')
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

router.get('/dailyBalance/previous', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const id = req.params._id;
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = req.session.date;

  if(date.day > 1){
    date.day -= 1;
  }
  else if (date.day < 2 && (date.monthNumber == 0 || date.monthNumber == 1 || date.monthNumber == 3 || date.monthNumber == 5 || date.monthNumber == 7 || date.monthNumber == 8 || date.monthNumber == 10)) {
    date.day = 31;
    if(date.monthNumber == 0){
      date.monthNumber = 11;
    }
    else {
      date.monthNumber -=1;
      date.year -= 1;
    }
  }
  else if (date.day < 2 && (date.monthNumber == 4 || date.monthNumber == 6 || date.monthNumber == 9 || date.monthNumber == 11)) {
    date.day = 30;
    date.year -= 1;
  }
  else if(date.day < 2 && date.monthNumber == 2 && ((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))){
    date.day = 29;
    date.monthNumber -= 1;
  }
  else if(date.day < 2 && date.monthNumber == 2 && !((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))){
    date.day = 28;
    date.monthNumber -= 1;
  }

  Rent.getAllByDate(date.day, date.month, date.year).then((rents) => {
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.discount, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByDateAndStartLocal("Matriz", date.day, date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.discount, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByDateAndStartLocal("Mirante Bem-Ti-Vi", date.day, date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByDateAndStartLocal("Vila Pampulha", date.day, date.month,date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByDateAndStartLocal("Shopping Contagem", date.day, date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            totalProfit = totalProfit.toFixed(2);
            matrizProfit = matrizProfit.toFixed(2);
            miranteProfit = miranteProfit.toFixed(2);
            vilaProfit = vilaProfit.toFixed(2);
            contagemProfit = contagemProfit.toFixed(2);
            res.render('dailyBalancePrevious', { title: 'Info', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date });
          }).catch((error) => {
            console.log(error);
            res.redirect('/error')
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error')
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error')
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

router.get('/dailyBalance/next', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const id = req.params._id;
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = req.session.date;
  var date_at = new Date();
  var date_at = {
    year: date_at.getFullYear(),
    month:   months[date_at.getMonth()],
    monthNumber: (date_at.getMonth()+1),
    day: date_at.getDate()
  }

  if(date.day < 28){
    date.day += 1;
  }
  else if (date.day < 31 && (date.monthNumber == 0 || date.monthNumber == 2 || date.monthNumber == 4 || date.monthNumber == 6 || date.monthNumber == 7 || date.monthNumber == 9 || date.monthNumber == 11)) {
    date.day += 1;
  }
  else if (date.day == 31 && (date.monthNumber == 0 || date.monthNumber == 2 || date.monthNumber == 4 || date.monthNumber == 6 || date.monthNumber == 7 || date.monthNumber == 9 || date.monthNumber == 11)) {
    date.day = 1;
    if(date.monthNumber == 11){
      date.monthNumber = 1;
      date.year += 1;
    }
    else{
      date.monthNumber += 1;
    }
  }
  else if (date.day < 30 && (date.monthNumber == 3 || date.monthNumber == 5 || date.monthNumber == 8 || date.monthNumber == 10)) {
    date.day += 1;
  }
  else if (date.day == 30 && (date.monthNumber == 3 || date.monthNumber == 5 || date.monthNumber == 8 || date.monthNumber == 10)) {
    date.day = 1;
    date.monthNumber += 1;
  }
  else if(date.day < 29 && date.monthNumber == 2 && ((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))){
    date.day += 1;
  }
  else if(date.day == 29 && date.monthNumber == 2 && ((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))){
    date.day = 1;
    date.monthNumber +=1;
  }
  else if(date.day < 28 && date.monthNumber == 2 && !((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))){
    date.day += 1;
  }
  else if(date.day == 28 && date.monthNumber == 2 && !((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))){
    date.day = 1;
    date.monthNumber +=1;
  }

  if (date_at.day == date.day && date_at.monthNumber == date.monthNumber && date_at.year == date.year) {
    console.log("aqui");
    res.redirect('/monthlyBalance');
  }

  Rent.getAllByDate(date.day, date.month, date.year).then((rents) => {
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.discount, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByDateAndStartLocal("Matriz", date.day, date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.discount, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByDateAndStartLocal("Mirante Bem-Ti-Vi", date.day, date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByDateAndStartLocal("Vila Pampulha", date.day, date.month,date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByDateAndStartLocal("Shopping Contagem", date.day, date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            totalProfit = totalProfit.toFixed(2);
            matrizProfit = matrizProfit.toFixed(2);
            miranteProfit = miranteProfit.toFixed(2);
            vilaProfit = vilaProfit.toFixed(2);
            contagemProfit = contagemProfit.toFixed(2);
            res.render('dailyBalancePrevious', { title: 'Info', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date });
          }).catch((error) => {
            console.log(error);
            res.redirect('/error')
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error')
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error')
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET daily Report */

router.get('/dailyReport', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const daily = req.session.dailyReport;
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = req.session.date;
  Rent.getAllByDateAndEndLocal(daily.endLocal, date.day , date.month, date.year).then((rents) => {
    rents.forEach(rent => {
      if (rent.discount != null) {
        var aux = rent.discount;
        rent.discount = aux.toFixed(2);
      }
    });
    res.render('dailyReport', { title: 'Relatório Diário', ...req.session, rents, date});
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

router.post('/dailyReport', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const endLocal = req.body.local;
  console.log(req.session);
  var dailyReport = {
    endLocal: req.body.local
  };
  req.session.dailyReport = dailyReport;
  console.log(req.session);
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = req.session.date;
  Rent.getAllByDateAndEndLocal(endLocal, date.day , date.month, date.year).then((rents) => {
    rents.forEach(rent => {
      if (rent.discount != null) {
        var aux = rent.discount;
        rent.discount = aux.toFixed(2);
      }
    });
    res.render('dailyReport', { title: 'Relatório Diário', ...req.session, rents, date});
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET daily Rent report Details  */
router.get('/dailyReportDetails/:_id', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const id = req.params._id;
  Rent.getById(id).then((rent) => {
    if (rent.receivedPrice != null) {
      var aux = rent.receivedPrice;
      rent.receivedPrice = aux.toFixed(2);
    }
    if (rent.discount != null) {
      var aux = rent.discount;
      rent.discount = aux.toFixed(2);
    }
    res.render('dailyReportDetails', { title: 'Info', ...req.session, rent});
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET dailyBalance */
router.get('/monthlyBalance', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = new Date();
  var date = {
    year: date.getFullYear(),
    month:   months[date.getMonth()],
    monthNumber: (date.getMonth()+1),
    hour: date.getHours()
  }
  req.session.date = date;
  Rent.getAllByMonth(date.month, date.year).then((rents) => {
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.discount, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByMonthAndEndLocal("Matriz", date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.discount, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByMonthAndEndLocal("Mirante Bem-Ti-Vi", date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByMonthAndEndLocal("Vila Pampulha", date.month, date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByMonthAndEndLocal("Shopping Contagem", date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            res.render('monthlyBalance', { title: 'Info', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date});
          }).catch((error) => {
            console.log(error);
            res.redirect('/error')
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error')
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error')
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

router.get('/monthlyBalance/Previous', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = req.session.date;
  if(date.monthNumber > 1){
    date.monthNumber -= 1;
    date.month = months[date.monthNumber -1];
  }
  else if (date.monthNumber == 1) {
    date.monthNumber = 12;
    date.month = months[11];
    date.year -= 1;
  }
  Rent.getAllByMonth(date.month, date.year).then((rents) => {
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.discount, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByMonthAndStartLocal("Matriz", date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.discount, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByMonthAndStartLocal("Mirante Bem-Ti-Vi", date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByMonthAndStartLocal("Vila Pampulha", date.month, date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByMonthAndStartLocal("Shopping Contagem", date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            res.render('monthlyBalancePrevious', { title: 'Info', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date});
          }).catch((error) => {
            console.log(error);
            res.redirect('/error')
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error')
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error')
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

router.get('/monthlyBalance/Next', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = req.session.date;
  var date_at = new Date();
  var date_at = {
    year: date_at.getFullYear(),
    month:   months[date_at.getMonth()],
    monthNumber: (date_at.getMonth()+1)
  }

  if(date.monthNumber < 12){
      date.monthNumber += 1;
      date.month = months[date.monthNumber + 1];
    }
    else if (date.monthNumber == 12) {
        date.monthNumber = 1;
        date.month = months[0];
        date.year += 1;
      }

  if (date_at.monthNumber == date.monthNumber && date_at.year == date.year) {
    res.redirect('/monthlyBalance');
  }
  Rent.getAllByMonth(date.month, date.year).then((rents) => {
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.discount, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByMonthAndStartLocal("Matriz", date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.discount, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByMonthAndStartLocal("Mirante Bem-Ti-Vi", date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByMonthAndStartLocal("Vila Pampulha", date.month, date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByMonthAndStartLocal("Shopping Contagem", date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            res.render('monthlyBalancePrevious', { title: 'Info', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date});
          }).catch((error) => {
            console.log(error);
            res.redirect('/error')
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error')
        });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error')
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});


/* GET daily Report */
router.post('/monthlyReport', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const startLocal = req.body.local;
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var year = req.session.date.year;
  var month = req.session.date.month;
  var monthNumber = req.session.date.monthNumber;
  Rent.getAllByMonthAndStartLocal(startLocal, month, year).then((rents) => {
    res.render('monthlyReport', { title: 'Relatório Mensal', ...req.session, rents, monthNumber, year});
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET daily Rent report Details  */
router.get('/monthlyReportDetails/:_id', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const id = req.params._id;
  Rent.getById(id).then((rent) => {
    res.render('monthlyReportDetails', { title: 'Info', ...req.session, rent});
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET equipament Balance */
router.get('/equipamentBalance', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = new Date();
  var date = {
    year: date.getFullYear(),
    month:   months[date.getMonth()],
    monthNumber: (date.getMonth()+1),
    hour: date.getHours()
  }
console.log(date);
  req.session.date = date;
  console.log(req.session);
  Equipament.getAll().then((equipaments) => {
    Rent.getAllByMonth(date.month,date.year).then((rents) =>{
      equipaments.forEach(equipament => {
        console.log(equipament._id);
        equipament.rents = 0;
        equipament.value = 0;
        // console.log(equipament);
        rents.forEach(rent => {
          if (equipament.name == rent.equipament.name){
            equipament.rents += rent.quantity;
            equipament.value += rent.receivedPrice;
          }
        });
      });
      res.render('equipamentBalance', { title: 'Balanço de Equipamentos', ...req.session, equipaments, date});
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET equipament Balance previous */
router.get('/equipamentBalance/previous', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = req.session.date;
  if(date.monthNumber > 1){
    date.monthNumber -= 1;
    date.month = months[date.monthNumber -1];
  }
  else if (date.monthNumber == 1) {
    date.monthNumber = 12;
    date.month = months[11];
    date.year -= 1;
  }
console.log(date);
//   req.session.date = date;
  console.log(req.session);
  Equipament.getAll().then((equipaments) => {
    Rent.getAllByMonth(date.month,date.year).then((rents) =>{
      equipaments.forEach(equipament => {
        console.log(equipament._id);
        equipament.rents = 0;
        equipament.value = 0;
        // console.log(equipament);
        rents.forEach(rent => {
          if (equipament.name == rent.equipament.name){
            equipament.rents += rent.quantity;
            equipament.value += rent.receivedPrice;
          }
        });
      });
      res.render('equipamentBalancePrevious', { title: 'Balanço de Equipamentos', ...req.session, equipaments});
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET equipament Balance previous */
router.get('/equipamentBalance/next', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = req.session.date;
  var date_at = new Date();
  var date_at = {
    year: date_at.getFullYear(),
    month:   months[date_at.getMonth()],
    monthNumber: (date_at.getMonth()+1)
  }

  if(date.monthNumber < 12){
      date.monthNumber += 1;
      date.month = months[date.monthNumber + 1];
    }
    else if (date.monthNumber == 12) {
        date.monthNumber = 1;
        date.month = months[0];
        date.year += 1;
    }

  if (date_at.monthNumber == date.monthNumber && date_at.year == date.year) {
    res.redirect('/equipamentBalance');
  }

  Equipament.getAll().then((equipaments) => {
    Rent.getAllByMonth(date.month,date.year).then((rents) =>{
      equipaments.forEach(equipament => {
        // console.log(equipament._id);
        equipament.rents = 0;
        equipament.value = 0;
        // console.log(equipament);
        rents.forEach(rent => {
          if (equipament.name == rent.equipament.name){
            equipament.rents += rent.quantity;
            equipament.value += rent.receivedPrice;
          }
        });
      });
      res.render('equipamentBalancePrevious', { title: 'Balanço de Equipamentos', ...req.session, equipaments, date});
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET show Rent */
router.get('/clientList' , auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  Client.getAll().then((clients) => {
    res.render('clientList', { title: 'Lista de Clientes', ...req.session, clients});
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET daily Rent report Details  */
router.get('/client/:_id', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const id = req.params._id;
  Client.getById(id).then((client) => {
    res.render('clientDetails', { title: 'Info', ...req.session, client});
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

module.exports = router;
