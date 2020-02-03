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
  console.log(client);
  var text = "/newRent/" + client.cpf;
  console.log(text);
  Client.create(client).then((client_id) => {
    res.redirect(text);
  }).catch((error) => {
    console.log(error);
    res.redirect('error');
  });
});

router.get('/newRent/:cpf', auth.isAuthenticated, function(req, res, next) {
  var cpf = req.params.cpf;
  res.render('newRentCpf', { title: 'Novo Aluguel', ...req.session, cpf });
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
    var clientId = client._id;
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
    if (rent.remainingQuantity === 0) {
      rent.status = "Finalizado";
    }
    var time = parseInt(close.rentTime);
    rent.receivedPrice += close.returnQuantity*rent.equipament.price*time;
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
    rent.totalTime = Math.trunc((rent.endTime - rent.startTime)/60000);

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

/* GET dailyBalance */
router.get('/dailyBalance', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const id = req.params._id;
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = new Date();
  var year = date.getFullYear();
  var month = months[date.getMonth()];
  var monthNumber = (date.getMonth()+1);
  var day = date.getDate();
  Rent.getAllByDate(day, month, year).then((rents) => {
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.receivedPrice, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByDateAndStartLocal("Matriz", day, month, year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.receivedPrice, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByDateAndStartLocal("Mirante Bem-Ti-Vi", day, month, year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.receivedPrice, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByDateAndStartLocal("Vila Pampulha", day, month, year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.receivedPrice, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByDateAndStartLocal("Shopping Contagem", day, month, year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.receivedPrice, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            res.render('dailyBalance', { title: 'Info', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, day, monthNumber, year, });
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
router.post('/dailyReport', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const startLocal = req.body.local;
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var date = new Date();
  var year = date.getFullYear();
  var month = months[date.getMonth()];
  var monthNumber = (date.getMonth()+1);
  var day = date.getDate();
  Rent.getAllByDateAndStartLocal(startLocal, day , month, year).then((rents) => {
    res.render('dailyReport', { title: 'Relatório Diário', ...req.session, rents, day, monthNumber, year});
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET daily Rent report Details  */
router.get('/dailyReportDetails/:_id', auth.isAuthenticated, auth.isMaster, function(req, res, next) {
  const id = req.params._id;
  Rent.getById(id).then((rent) => {
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
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.receivedPrice, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByMonthAndStartLocal("Matriz", date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.receivedPrice, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByMonthAndStartLocal("Mirante Bem-Ti-Vi", date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.receivedPrice, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByMonthAndStartLocal("Vila Pampulha", date.month, date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.receivedPrice, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByMonthAndStartLocal("Shopping Contagem", date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.receivedPrice, 0);
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
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.receivedPrice, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByMonthAndStartLocal("Matriz", date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.receivedPrice, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByMonthAndStartLocal("Mirante Bem-Ti-Vi", date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.receivedPrice, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByMonthAndStartLocal("Vila Pampulha", date.month, date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.receivedPrice, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByMonthAndStartLocal("Shopping Contagem", date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.receivedPrice, 0);
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
  if (date_at.monthNumber == date.monthNumber && date_at.year == date.year) {
    res.redirect('/monthlyBalance');
  }
  else {
    if(date.monthNumber < 12){
        date.monthNumber += 1;
        date.month = months[date.monthNumber + 1];
      }
      else if (date.monthNumber == 12) {
          date.monthNumber = 1;
          date.month = months[0];
          date.year += 1;
        }
  }
  Rent.getAllByMonth(date.month, date.year).then((rents) => {
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.receivedPrice, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByMonthAndStartLocal("Matriz", date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.receivedPrice, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByMonthAndStartLocal("Mirante Bem-Ti-Vi", date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.receivedPrice, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByMonthAndStartLocal("Vila Pampulha", date.month, date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.receivedPrice, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByMonthAndStartLocal("Shopping Contagem", date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.receivedPrice, 0);
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
  if (date_at.monthNumber == date.monthNumber && date_at.year == date.year) {
    res.redirect('/equipamentBalance');
  }
  else {
    if(date.monthNumber < 12){
        date.monthNumber += 1;
        date.month = months[date.monthNumber + 1];
      }
      else if (date.monthNumber == 12) {
          date.monthNumber = 1;
          date.month = months[0];
          date.year += 1;
        }
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
