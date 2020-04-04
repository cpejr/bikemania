var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const auth = require('./middleware/auth');
const mongodb = require('../models/user');
const Client = require('../models/client');
const Equipament = require('../models/equipament');
const Rent = require('../models/rent');

const moment = require('moment');

/* GET login page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'Entrar' });
});

/* POST login route */
router.post('/login', function (req, res, next) {
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

/* GET forgotPassword page */
router.get('/forgotPassword', (req, res) => {
  res.render('forgotPassword', { title: 'Esqueci Minha Senha' });
});

router.post('/forgotPassword', (req, res) => {
  const emailAddress = req.body.user.userName;
  firebase.auth().sendPasswordResetEmail(emailAddress).then(function () {
    res.redirect('/');
    req.flash('success', 'Email enviado');
  }).catch((error) => {
    console.log(error);
    res.redirect('/error');
  });
});

/* GET home page. */
router.get('/home', auth.isAuthenticated, function (req, res, next) {
  if (req.session.logado.type == 'Master') {
    res.render('homemaster', { title: 'Home', ...req.session });
  }
  else {
    res.render('home', { title: 'Home', ...req.session });
  }
});

/* POST Mirante route */
router.post('/dashboardMirante', auth.isAuthenticated, function (req, res, next) {
  req.session.unidade = "Bem-Te-Vi";
  res.redirect(`/dashboard`);
});

/* POST Vila route */
router.post('/dashboardVila', auth.isAuthenticated, function (req, res, next) {
  req.session.unidade = "Vila Pampulha";
  res.redirect(`/dashboard`);
});

/* POST Matriz route */
router.post('/dashboardMatriz', auth.isAuthenticated, function (req, res, next) {
  req.session.unidade = "Matriz";
  res.redirect(`/dashboard`);
});

/* POST Contagem route */
router.post('/dashboardContagem', auth.isAuthenticated, function (req, res, next) {
  req.session.unidade = "Shopping Contagem";
  res.redirect(`/dashboard`);
});

/* GET Dashboard page */
router.get('/dashboard', auth.isAuthenticated, function (req, res, next) {
  var unity = req.session.unidade;
  Rent.getAllByStartLocalRodando(unity).then((rentsAguardando) => {
    Rent.getAllByStartLocalAguardando(unity).then((rents) => {
      Rent.getAllByEndLocalWaiting(unity).then((rentsWaiting) => {
        var clientsRunning = [];
        if ((rents.length > 0) || (rentsAguardando.length > 0)) {
          rents.forEach(rent => {
            var aux = true;
            for (var i = 0; i < clientsRunning.length; i++) {
              if (rent.client.cpf == clientsRunning[i].cpf) {
                aux = false;
              }
            }
            if (aux == true) {
              clientsRunning.push(rent.client);
            }
          });
          rentsAguardando.forEach(rent => {
            var aux = true;
            for (var i = 0; i < clientsRunning.length; i++) {
              if (rent.client.cpf == clientsRunning[i].cpf) {
                aux = false;
              }
            }
            if (aux == true) {
              clientsRunning.push(rent.client);
            }
          });
        }
        if (rentsWaiting.length > 0) {
          rentsWaiting.forEach(rentWaiting => {
            var aux = true;
            for (var i = 0; i < clientsRunning.length; i++) {
              if (rentWaiting.client.cpf == clientsRunning[i].cpf) {
                aux = false;
              }
            }
            if (aux == true) {
              clientsRunning.push(rentWaiting.client);
            }
          });
        }
        if (req.session.logado.type == 'Master') {
          res.render('dashboardMaster', { title: 'Dashboard Master', ...req.session, clientsRunning });
        }
        else {
          res.render('dashboard', { title: 'Dashboard', ...req.session, clientsRunning });
        }
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

/* GET logout */
router.get('/logout', auth.isAuthenticated, function (req, res, next) {
  delete req.session.logado;
  delete req.session.unidade;
  firebase.auth().signOut().then(function () {
    res.redirect(`/`);
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET signup */
router.get('/signup', auth.isAuthenticated, function (req, res, next) {
  res.render('signup', { title: 'Cadastro de Cliente' });
});

/* POST signup */
router.post('/signup', auth.isAuthenticated, function (req, res) {
  const client = req.body.client;
  var text = "/newRent/" + client.cpf;
  Client.create(client).then((client_id) => {
    res.redirect(text);
  }).catch((error) => {
    console.log(error);
    switch (error.code) {
      case 11000:
        if (error.keyPattern.cpf) {
          req.flash('danger', 'CPF inserido já está em uso');
        }
        else if (error.keyPattern.rg) {
          req.flash('danger', 'RG inserido já está em uso');
        }
        break;
    }
    res.redirect('/signup');
  });
});

router.get('/returnName/:cpf', auth.isAuthenticated, function (req, res, next) {
  var cpf = req.params.cpf;
  Client.getByCpf(cpf).then((client) => {
    var name = client.name;
    res.send(name);
  }).catch((error) => {
    console.log(error);
  });
});

/* GET new Rent with CPF*/
router.get('/newRent/:cpf', auth.isAuthenticated, function (req, res, next) {
  var cpf = req.params.cpf;
  Client.getByCpf(cpf).then((client) => {
    var name = client.name;
    res.render('newRent', { title: 'Novo Aluguel', ...req.session, cpf, name });
  }).catch((error) => {
    console.log(error);
  });
});

/* GET new Rent */
router.get('/newRent', auth.isAuthenticated, function (req, res, next) {
  res.render('newRent', { title: 'Novo Aluguel', ...req.session });
});

/* POST new Rent */
router.post('/newRent', auth.isAuthenticated, function (req, res, next) {
  const rent = req.body.rent;
  var arrayEquipament = rent.equipamentName;
  var arrayQuantity = rent.quantity;
  var arrayLength = arrayEquipament.length;
  var date = new Date();
  var hour = date.getHours();
  var minutes = date.getMinutes();
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
  Client.getByCpf(rent.cpf).then((client) => {
    rent.client = client;
    rent.quantity = parseInt(rent.quantity);
    client.equipamentRents = parseInt(client.equipamentRents);
    client.equipamentRents += rent.quantity;
    var clientId = client._id;
    Client.update(clientId, client).then(() => {
      if (arrayEquipament[1].length == 1) {
        arrayLength = 1;
      }
      for (var i = 0; i < arrayLength; i++) {
        var nameeq = arrayEquipament[i];
        var numeq = arrayQuantity[i];
        if (arrayLength == 1) {
          nameeq = arrayEquipament;
          numeq = arrayQuantity;
        }
        Equipament.getByNameI(nameeq, i).then((equipament) => {
          var ii = Number(equipament.i);
          if (arrayLength > 1) {
            numeq = arrayQuantity[ii]
          }
          var aluguel = rent;
          delete aluguel.equipamentName;
          delete aluguel.quantity;
          delete aluguel.remainingQuantity;
          aluguel.equipament = equipament;
          aluguel.quantity = numeq;
          aluguel.remainingQuantity = numeq;
          aluguel.statusredirect = "show";
          Rent.create(aluguel).then((aluguel) => {
            res.redirect('/dashboard');
          }).catch((error) => {
            console.log(error);
            res.redirect('error');
          });
        }).catch((error) => {
          console.log(error);
          res.redirect('/error')
        });
      }
    }).catch((error) => {
      console.log(error);
      res.redirect('error');
    });
  }).catch((error) => {
    req.flash('danger', "CPF não cadastrado");
    console.log(error);
    res.redirect('/newRent');
  });
});

/* POST delete Rent */
router.post('/delete/:_id', auth.isAuthenticated, function (req, res, next) {
  const id = req.params._id;
  Rent.delete(id);
  res.redirect(`/dashboard`);
});

/* GET partialPRICE */
router.get('/partialPrice/:_id', function (req, res) {
  var id = req.params;
  Rent.getById(id).then((rent) => {
    var date = new Date();
    var now = date.getTime();
    var rentTime = Math.trunc((now - rent.startTime) / 60000);
    var price = rent.equipament.price;
    var name = rent.equipament.name;
    var priceEquipament;
    res.send({ price, rentTime, name, priceEquipament });
  }).catch((error) => {
    console.log("erro aqui");
    console.log(error);
  });
});

/* GET actualPrice Rent */
router.get('/show/:_id', auth.isAuthenticated, function (req, res, next) {
  const id = req.params._id;
  Rent.getById(id).then((rent) => {
    var size = rent.client.datePoints;
    var points = size.length;
    var sale = 1;
    var date = new Date();
    var now = date.getTime();
    var rentTime = Math.trunc((now - rent.startTime) / 60000);
    if (rent.sale == "Ativado") {
      sale = 0.5;
    }
    var actualPrice = rent.quantity * rent.equipament.price * rentTime * sale;
    var unitPrice = rent.equipament.price;
    var partialPrice = rent.equipament.price * rentTime * sale;
    unitPrice = unitPrice.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });;
    actualPrice = actualPrice.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    partialPrice = partialPrice.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    res.render('show', { title: 'Encerrar Aluguel', ...req.session, rent, points, rentTime, actualPrice, unitPrice, now, id });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET close Rent */
router.post('/close/:_id', function (req, res, next) {
  // Pontos de Fidelidade
  var atualDate = new Date();
  var day = atualDate.getDate();
  var month = atualDate.getMonth();
  month++;
  var year = atualDate.getFullYear();
  var fulldate = year + "-" + month + "-" + day;
  // ---------------------------------------------
  const id = req.params._id;
  const close = req.body.close;
  Rent.getById(id).then((rent) => {
    // Pontos de Fidelidade
    Client.getDatePointsById(rent.client.id).then((datePoints) => {
      var aux = true;
      for (var i = 0; i < datePoints.length; i++) {
        var date = new Date(datePoints[i]);
        if (day == date.getDate() && month == (date.getMonth() + 1) && year == date.getFullYear()) {
          aux = false;
        }
        var msAtualDate = atualDate.getTime();
        var msDate = date.getTime();
        const diff = Math.abs(msAtualDate - msDate);
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days > 180) {
          datePoints.splice(i, 1);
        }
      }
      if (aux == true) {
        datePoints.push(fulldate);
      }
      var size = datePoints.length;
      for (var i = 0; i < size - 1; i++) {
        if (size == 11) {
          datePoints.shift();
        }
      }
      Client.updateDatePoints(rent.client.id, datePoints);
    }).catch((error) => {
      console.log("erro aqui");
      console.log(error);
    });
    rent.endLocal = close.endLocal;
    rent.remainingQuantity -= close.returnQuantity;
    var renderaux = 1;
    if (rent.remainingQuantity === 0) {
      rent.status = "Aguardando Pagamento";
      rent.statusredirect = "aguardando";
      rent.quantity = close.returnQuantity;
      rent.remainingQuantity = close.returnQuantity;
      renderaux = 2;
    }
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
    rent.totalTime = Math.trunc((rent.endTime - rent.startTime) / 60000);

    close.status = "Aguardando Pagamento";
    close.statusredirect = "aguardando";
    close.startLocal = rent.startLocal;
    close.endLocal = rent.endLocal;
    close.year = rent.year;
    close.month = rent.month;
    close.day = rent.day;
    close.startHour = rent.startHour;
    close.endHour = rent.endHour;
    close.totalTime = rent.totalTime;
    close.startTime = rent.startTime;
    close.endTime = rent.endTime;
    close.client = rent.client;
    close.equipament = rent.equipament;
    close.quantity = close.returnQuantity;
    close.remainingQuantity = close.quantity;
    close.cpf = rent.cpf;

    var partialPriceNumber = close.partialPrice.replace("R$", "");
    partialPriceNumber = partialPriceNumber.replace(".", "");
    partialPriceNumber = Number(partialPriceNumber.replace(",", "."));


    close.partialPrice = partialPriceNumber;
    close.receivedPrice = partialPriceNumber;
    close.discount = partialPriceNumber;

    rent.partialPrice = partialPriceNumber;
    if (renderaux == 2) {
      rent.receivedPrice = partialPriceNumber;
      rent.partialPrice = partialPriceNumber;
      rent.discount = partialPriceNumber;
    }
    Rent.update(id, rent);
    if (renderaux == 2) {
      res.redirect('/aguardando/' + id);
    }
    else if (renderaux == 1) {
      Rent.create(close).then((closeID) => {
        res.redirect('/aguardando/' + closeID._id);
      }).catch((error) => {
        console.log(error);
        res.redirect('/error')
      });
    }
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET close Rent */
router.post('/dailyReport/edit/:_id', function (req, res, next) {
  const id = req.params._id;
  const price = req.body.price;
  Rent.getById(id).then((rent) => {
    rent.discount = price;
    rent.atualization = "Atualizado";
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
router.get('/dailyBalance', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = new Date();
  var date = {
    year: date.getFullYear(),
    month: months[date.getMonth()],
    monthNumber: (date.getMonth() + 1),
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
      Rent.getAllByDateAndEndLocal("Bem-Te-Vi", date.day, date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByDateAndEndLocal("Vila Pampulha", date.day, date.month, date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByDateAndEndLocal("Shopping Contagem", date.day, date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            contagemProfit = contagemProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            miranteProfit = miranteProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            vilaProfit = vilaProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            matrizProfit = matrizProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            totalProfit = totalProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

            res.render('dailyBalance', { title: 'Balanço Diário', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date });
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

router.get('/dailyBalance/previous', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  var date = req.session.date;

  if (date.day > 1) {
    date.day -= 1;
  }
  else if (date.day < 2 && (date.monthNumber == 0 || date.monthNumber == 1 || date.monthNumber == 3 || date.monthNumber == 5 || date.monthNumber == 7 || date.monthNumber == 8 || date.monthNumber == 10)) {
    date.day = 31;
    if (date.monthNumber == 0) {
      date.monthNumber = 11;
    }
    else {
      date.monthNumber -= 1;
      date.year -= 1;
    }
  }
  else if (date.day < 2 && (date.monthNumber == 4 || date.monthNumber == 6 || date.monthNumber == 9 || date.monthNumber == 11)) {
    date.day = 30;
    date.year -= 1;
  }
  else if (date.day < 2 && date.monthNumber == 2 && ((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))) {
    date.day = 29;
    date.monthNumber -= 1;
  }
  else if (date.day < 2 && date.monthNumber == 2 && !((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))) {
    date.day = 28;
    date.monthNumber -= 1;
  }

  date.month = months[date.monthNumber - 1];

            res.render('dailyBalancePrevious', { title: 'Balanço Diário', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date });
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

router.get('/dailyBalance/next', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = req.session.date;
  var date_at = new Date();
  var date_at = {
    year: date_at.getFullYear(),
    month: months[date_at.getMonth()],
    monthNumber: (date_at.getMonth() + 1),
    day: date_at.getDate()
  }

  if (date.day < 28) {
    date.day += 1;
  }
  else if (date.day < 31 && (date.monthNumber == 0 || date.monthNumber == 2 || date.monthNumber == 4 || date.monthNumber == 6 || date.monthNumber == 7 || date.monthNumber == 9 || date.monthNumber == 11)) {
    date.day += 1;
  }
  else if (date.day == 31 && (date.monthNumber == 0 || date.monthNumber == 2 || date.monthNumber == 4 || date.monthNumber == 6 || date.monthNumber == 7 || date.monthNumber == 9 || date.monthNumber == 11)) {
    date.day = 1;
    if (date.monthNumber == 11) {
      date.monthNumber = 1;
      date.year += 1;
    }
    else {
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
  else if (date.day < 29 && date.monthNumber == 2 && ((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))) {
    date.day += 1;
  }
  else if (date.day == 29 && date.monthNumber == 2 && ((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))) {
    date.day = 1;
    date.monthNumber += 1;
  }
  else if (date.day < 28 && date.monthNumber == 2 && !((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))) {
    date.day += 1;
  }
  else if (date.day == 28 && date.monthNumber == 2 && !((date.year % 4 == 0) && ((date.year % 100 != 0) || (date.year % 400 == 0)))) {
    date.day = 1;
    date.monthNumber += 1;
  }

  if (date_at.day == date.day && date_at.monthNumber == date.monthNumber && date_at.year == date.year) {
    res.redirect('/dailyBalance');
  }
  else {

    Rent.getAllByDate(date.day, date.month, date.year).then((rents) => {
      let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.discount, 0);
      let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
      Rent.getAllByDateAndStartLocal("Matriz", date.day, date.month, date.year).then((matrizRents) => {
        let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.discount, 0);
        let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
        Rent.getAllByDateAndStartLocal("Bem-Te-Vi", date.day, date.month, date.year).then((miranteRents) => {
          let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
          let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
          Rent.getAllByDateAndStartLocal("Vila Pampulha", date.day, date.month, date.year).then((vilaRents) => {
            let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
            let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
            Rent.getAllByDateAndStartLocal("Shopping Contagem", date.day, date.month, date.year).then((contagemRents) => {
              let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
              let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
              contagemProfit = contagemProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
              miranteProfit = miranteProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
              vilaProfit = vilaProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
              matrizProfit = matrizProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
              totalProfit = totalProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
              res.render('dailyBalancePrevious', { title: 'Balanço Diário', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date });
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
  }
});

/* GET daily Report */
router.get('/dailyReport', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  const daily = req.session.dailyReport;
  var date = req.session.date;
  Rent.getAllByDateAndEndLocal(daily.endLocal, date.day, date.month, date.year).then((rents) => {
    rents.forEach(rent => {
      if (rent.discount != null) {
        rent.discountR$ = rent.discount.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
      }
    });
    res.render('dailyReport', { title: 'Relatório Diário', ...req.session, rents, date });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

router.post('/dailyReport', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  const endLocal = req.body.local;
  var dailyReport = {
    endLocal: req.body.local
  };
  req.session.dailyReport = dailyReport;
  var date = req.session.date;
  Rent.getAllByDateAndEndLocal(endLocal, date.day, date.month, date.year).then((rents) => {
    rents.forEach(rent => {
      if (rent.discount != null) {
        rent.discountR$ = rent.discount.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
      }
    });
    res.render('dailyReport', { title: 'Relatório Diário', ...req.session, rents, date });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET daily Rent report Details  */
router.get('/dailyReportDetails/:_id', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  const id = req.params._id;
  Rent.getById(id).then((rent) => {
    if (rent.receivedPrice != null) {
      rent.receivedPriceR$ = rent.receivedPrice.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }
    if (rent.discount != null) {
      rent.discountR$ = rent.discount.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }
    res.render('dailyReportDetails', { title: 'Relatório Diário Detalhes', ...req.session, rent });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

router.get('/getdailyBalance/::month::year::local', function (req, res, next) {
  var id = req.params;
  var day = [];
  var Profit = [];
  var Units = [];
  Rent.getAllByMonthAndEndLocal(id.local, id.month, id.year).then((Rents) => {
    Rents.forEach(rent => {
      var aux = 0;
      for (var i = 0; i < day.length; i++) {
        if (day[i] == rent.day) {
          Profit[i] += rent.discount;
          Units[i] += rent.quantity;
          aux = 1;
        }
      }
      if (aux == 0) {
        day.push(rent.day);
        Profit.push(rent.discount);
        Units.push(rent.quantity);
      }
    });
    res.send({ day, Profit, Units });
  });
});

/* GET dailyBalance */
router.get('/monthlyBalance', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = new Date();
  var date = {
    year: date.getFullYear(),
    month: months[date.getMonth()],
    monthNumber: (date.getMonth() + 1),
    hour: date.getHours(),
  }
  req.session.date = date;
  Rent.getAllByMonth(date.month, date.year).then((rents) => {
    let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.discount, 0);
    let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
    Rent.getAllByMonthAndEndLocal("Matriz", date.month, date.year).then((matrizRents) => {
      let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.discount, 0);
      let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
      Rent.getAllByMonthAndEndLocal("Bem-Te-Vi", date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByMonthAndEndLocal("Vila Pampulha", date.month, date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByMonthAndEndLocal("Shopping Contagem", date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            contagemProfit = contagemProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            miranteProfit = miranteProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            vilaProfit = vilaProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            matrizProfit = matrizProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            totalProfit = totalProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            res.render('monthlyBalance', { title: 'Balanço Mensal', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date });
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

router.get('/monthlyBalance/Previous', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = req.session.date;
  if (date.monthNumber > 1) {
    date.monthNumber -= 1;
    date.month = months[date.monthNumber - 1];
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
      Rent.getAllByMonthAndStartLocal("Bem-Te-Vi", date.month, date.year).then((miranteRents) => {
        let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
        let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
        Rent.getAllByMonthAndStartLocal("Vila Pampulha", date.month, date.year).then((vilaRents) => {
          let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
          let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
          Rent.getAllByMonthAndStartLocal("Shopping Contagem", date.month, date.year).then((contagemRents) => {
            let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
            let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
            contagemProfit = contagemProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            miranteProfit = miranteProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            vilaProfit = vilaProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            matrizProfit = matrizProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            totalProfit = totalProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
            res.render('monthlyBalancePrevious', { title: 'Balanço Mensal', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date });
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

router.get('/monthlyBalance/Next', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = req.session.date;
  var date_at = new Date();
  var date_at = {
    year: date_at.getFullYear(),
    month: months[date_at.getMonth()],
    monthNumber: (date_at.getMonth() + 1)
  }

  if (date.monthNumber < 12) {
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
  else {
    Rent.getAllByMonth(date.month, date.year).then((rents) => {
      let totalProfit = rents.reduce((totalProfit, cur) => totalProfit + cur.discount, 0);
      let totalUnits = rents.reduce((totalUnits, cur) => totalUnits + cur.quantity, 0);
      Rent.getAllByMonthAndStartLocal("Matriz", date.month, date.year).then((matrizRents) => {
        let matrizProfit = matrizRents.reduce((matrizProfit, cur) => matrizProfit + cur.discount, 0);
        let matrizUnits = matrizRents.reduce((matrizUnits, cur) => matrizUnits + cur.quantity, 0);
        Rent.getAllByMonthAndStartLocal("Bem-Te-Vi", date.month, date.year).then((miranteRents) => {
          let miranteProfit = miranteRents.reduce((miranteProfit, cur) => miranteProfit + cur.discount, 0);
          let miranteUnits = miranteRents.reduce((miranteUnits, cur) => miranteUnits + cur.quantity, 0);
          Rent.getAllByMonthAndStartLocal("Vila Pampulha", date.month, date.year).then((vilaRents) => {
            let vilaProfit = vilaRents.reduce((vilaProfit, cur) => vilaProfit + cur.discount, 0);
            let vilaUnits = vilaRents.reduce((vilaUnits, cur) => vilaUnits + cur.quantity, 0);
            Rent.getAllByMonthAndStartLocal("Shopping Contagem", date.month, date.year).then((contagemRents) => {
              let contagemProfit = contagemRents.reduce((contagemProfit, cur) => contagemProfit + cur.discount, 0);
              let contagemUnits = contagemRents.reduce((contagemUnits, cur) => contagemUnits + cur.quantity, 0);
              contagemProfit = contagemProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
              miranteProfit = miranteProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
              vilaProfit = vilaProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
              matrizProfit = matrizProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
              totalProfit = totalProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
              res.render('monthlyBalancePrevious', { title: 'Balanço Mensal', ...req.session, totalProfit, matrizProfit, matrizUnits, miranteProfit, miranteUnits, vilaProfit, vilaUnits, contagemProfit, contagemUnits, totalUnits, date });
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
  }
});

/* GET daily Report */
router.get('/monthlyReport', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  var year = req.session.date.year;
  var monthNumber = req.session.date.monthNumber;
  var unidade = req.session.monthlyReport.endLocal;
  res.render('monthlyReport', { title: 'Relatório Mensal', ...req.session, unidade, monthNumber, year });
});

// POST daily Report
router.post('/monthlyReport', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  const unidade = req.body.local;
  var year = req.session.date.year;
  var monthNumber = req.session.date.monthNumber;
  var monthlyReport = {
    endLocal: req.body.local
  };
  req.session.monthlyReport = monthlyReport;
  res.render('monthlyReport', { title: 'Relatório Mensal', ...req.session, unidade, monthNumber, year });
});

/* GET daily Rent report Details  */
router.get('/monthlyReportDetails/:_id', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  const id = req.params._id;
  Rent.getById(id).then((rent) => {
    res.render('monthlyReportDetails', { title: 'Relatório Mensal Detalhes', ...req.session, rent });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

router.post('/monthlyReport/edit/:_id', function (req, res, next) {
  const id = req.params._id;
  const price = req.body.price;
  Rent.getById(id).then((rent) => {
    rent.discount = price;
    Rent.update(id, rent).then((rent) => {
      res.redirect('/monthlyReport');
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }).catch((error) => {
    console.log(error);
    res.redirect('/error')
  });
});

/* GET equipament Balance */
router.get('/equipamentBalance', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = new Date();
  var date = {
    year: date.getFullYear(),
    month: months[date.getMonth()],
    monthNumber: (date.getMonth() + 1),
    hour: date.getHours()
  }
  req.session.date = date;
  Equipament.getAll().then((equipaments) => {
    Rent.getAllByMonth(date.month, date.year).then((rents) => {
      var totalUnits = 0;
      var totalProfit = 0;
      equipaments.forEach(equipament => {
        equipament.rents = 0;
        equipament.value = 0;
        rents.forEach(rent => {
          if (equipament.name == rent.equipament.name) {
            equipament.rents += rent.quantity;
            equipament.value += rent.discount;
          }
        });
        totalUnits += equipament.rents;
        totalProfit += equipament.value;
      });
      equipaments.forEach(equipament => {
        price = equipament.price;
        price = price.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        equipament.value = equipament.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        equipament.priceR$ = price;
      });
      totalProfit = totalProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
      res.render('equipamentBalance', { title: 'Balanço de Equipamentos', ...req.session, equipaments, date, totalUnits, totalProfit });
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
router.get('/equipamentBalance/previous', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = req.session.date;
  if (date.monthNumber > 1) {
    date.monthNumber -= 1;
    date.month = months[date.monthNumber - 1];
  }
  else if (date.monthNumber == 1) {
    date.monthNumber = 12;
    date.month = months[11];
    date.year -= 1;
  }
  Equipament.getAll().then((equipaments) => {
    Rent.getAllByMonth(date.month, date.year).then((rents) => {
      var totalUnits = 0;
      var totalProfit = 0;
      equipaments.forEach(equipament => {
        equipament.rents = 0;
        equipament.value = 0;
        rents.forEach(rent => {
          if (equipament.name == rent.equipament.name) {
            equipament.rents += rent.quantity;
            equipament.value += rent.discount;
          }
        });
        totalUnits += equipament.rents;
        totalProfit += equipament.value;
      });
      equipaments.forEach(equipament => {
        price = equipament.price;
        price = price.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        equipament.value = equipament.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        equipament.priceR$ = price;
      });
      totalProfit = totalProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
      res.render('equipamentBalancePrevious', { title: 'Balanço de Equipamentos', ...req.session, equipaments, date, totalUnits, totalProfit });
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
router.get('/equipamentBalance/next', auth.isAuthenticated, auth.isMaster, function (req, res, next) {
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = req.session.date;
  var date_at = new Date();
  var date_at = {
    year: date_at.getFullYear(),
    month: months[date_at.getMonth()],
    monthNumber: (date_at.getMonth() + 1)
  }

  if (date.monthNumber < 12) {
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
  else {
    Equipament.getAll().then((equipaments) => {
      Rent.getAllByMonth(date.month, date.year).then((rents) => {
        var totalUnits = 0;
        var totalProfit = 0;
        equipaments.forEach(equipament => {
          equipament.rents = 0;
          equipament.value = 0;
          rents.forEach(rent => {
            if (equipament.name == rent.equipament.name) {
              equipament.rents += rent.quantity;
              equipament.value += rent.discount;
            }
          });
          totalUnits += equipament.rents;
          totalProfit += equipament.value;
        });
        equipaments.forEach(equipament => {
          price = equipament.price;
          price = price.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
          equipament.value = equipament.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
          equipament.priceR$ = price;
        });
        totalProfit = totalProfit.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        res.render('equipamentBalancePrevious', { title: 'Balanço de Equipamentos', ...req.session, equipaments, date, totalUnits, totalProfit });
      }).catch((error) => {
        console.log(error);
        res.redirect('/error')
      });
    }).catch((error) => {
      console.log(error);
      res.redirect('/error')
    });
  }
});

/* GET dashboardClient */
router.get('/dashboardClient/:cpf', auth.isAuthenticated, function (req, res, next) {
  var cpf = req.params.cpf;
  var endLocal = req.session.unidade;
  Rent.getAllByStatusRodando(cpf, endLocal).then(rent => {
    Rent.getAllByStatusAguardando(cpf, endLocal).then(toPay => {
      var toPaySize = toPay.length;
      var pendingPayment = 0;
      for (var i = 0; i < toPaySize; i++) {
        pendingPayment += toPay[i].partialPrice;
      }
      pendingPayment = pendingPayment.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL"
      });    
      res.render("dashboardClient", {
        title: "Dashboard",
        ...req.session,
        cpf,
        rent,
        toPay,
        pendingPayment
      });
    })
      .catch(error => {
        console.log(error);
        res.redirect("/error")
      });
    }).catch((error) => {
      console.log(error);
      res.redirect("/error")
    });
  }).catch((error) => {
    console.log(error);
    res.redirect("/error")
  });
});

/* GET dashboardClientFunc */
router.get('/dashboardClientFunc/:cpf', auth.isAuthenticated, function (req, res, next) {
  var cpf = req.params.cpf;
  var endLocal = req.session.unidade;
  Rent.getByCpfAguardando(cpf).then((rentsWaiting) => {
    Rent.getByCpfRodando(cpf).then((rent) => {
      Rent.getAllByStatusAguardando(cpf, endLocal).then((toPay) => {
        var toPaySize = toPay.length;
        var pendingPayment = 0;
        for (var i = 0; i < toPaySize; i++) {
          pendingPayment += toPay[i].partialPrice;
        }
        pendingPayment = pendingPayment.toLocaleString("pt-br", {
          style: "currency",
          currency: "BRL"
        });
        console.log(rent);
        console.log(toPay);
        
        
        res.render("dashboardClientFunc", {
          title: "Dashboard",
          ...req.session,
          cpf,
          rent,
          rentsWaiting,
          pendingPayment,
          toPay
        });
      })
      .catch(error => {
        console.log(error);
        res.redirect("/error")
      });
    }).catch((error) => {
      console.log(error);
      res.redirect("/error")
    });
  }).catch((error) => {
    console.log(error);
    res.redirect("/error")
  });
});


/* GET show Rent */
router.get("/clientList", auth.isAuthenticated, auth.isMaster, function (
  req,
  res,
  next
) {
  Client.getAll()
    .then(clients => {
      res.render("clientList", {
        title: "Lista de Clientes",
        ...req.session,
        clients
      });
    })
    .catch(error => {
      console.log(error);
      res.redirect("/error");
    });
});

/* GET daily Rent report Details  */
router.get("/client/:_id", auth.isAuthenticated, auth.isMaster, function (
  req,
  res,
  next
) {
  const id = req.params._id;
  Client.getById(id)
    .then(client => {
      res.render("clientDetails", {
        title: "Lista de Clientes Detalhes",
        ...req.session,
        client
      });
    })
    .catch(error => {
      console.log(error);
      res.redirect("/error");
    });
});

/* GET aguardando Pagamento  */
router.get('/aguardando/:_id', auth.isAuthenticated, function (req, res) {
  const id = req.params._id;
  Rent.getById(id).then((rent) => {
    var partialPrice = rent.partialPrice;
    if (partialPrice != null) {
      partialPrice = partialPrice.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }
    partialPrice = partialPrice.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    res.render('aguardando', { title: 'Aguardando Pagamento', ...req.session, partialPrice, rent, id });
  }).catch(error => {
    console.log(error);
    res.redirect("/error")
  });
});

router.post('/pagamentoTotal/::cpf::endLocal', auth.isAuthenticated, function (req, res, next) {
  var cpf = req.params.cpf;
  var endLocal = req.params.endLocal;
  var end = req.body.end;
  Rent.getAllByStatusAguardando(cpf, endLocal).then((toPay) => {
    toPay.forEach(pay => {
      pay.status = "Finalizado";
      pay.payment = end.payment;
      Rent.update(pay._id, pay);
    });
    res.redirect('/dashboard');
  }).catch(error => {
    console.log(error);
    res.redirect("/error")
  });
});

router.post('/end/:_id', function (req, res) {
  const id = req.params._id;
  var end = req.body.end;
  Rent.getById(id).then((rent) => {
    rent.status = "Finalizado";
    rent.payment = end.payment;
    rent.hasDiscount = end.hasDiscount;
    rent.justification = end.justification;
    Rent.update(id, rent);
    res.redirect('/dashboard');
  }).catch(error => {
    console.log(error);
    res.redirect("/error")
  });
})

module.exports = router;
