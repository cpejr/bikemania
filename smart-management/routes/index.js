var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const auth = require('./middleware/auth');
const mongo = require('../models/user');
const Client = require('../models/client');
const Aluguel = require('../models/aluguel');
/* GET home page. */
router.get('/home',auth.isAuthenticated, function(req, res, next) {
    res.render('home', { title: 'Home' , ...req.session});
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
router.post('/novoaluguel', function(req, res, next) {
  const  aluguel  = req.body.aluguel;
  aluguel.local_saida=req.session.unidade;
    Aluguel.create(aluguel).then((aluguel_id) => {

      console.log("entrou");
      console.log(aluguel_id);
      console.log(aluguel);
    }).catch((error) => {
      console.log(error);
      res.redirect('error');
    });
    if(req.session.logado.type=='Master'){
      res.redirect('/acompmaster');
    }
  else{
    res.redirect('/acompanhamento')
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
  var locais= new Array;
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
      acess: String
    }

    if(alugueis[i].local_saida == logado){
    locaisInfo.id = alugueis[i]._id;
    locaisInfo.horarioretirada = alugueis[i].horario_retirada;
    locaisInfo.eq= alugueis[i].equipamento;
    locaisInfo._cpf = alugueis[i].cpf;
    locaisInfo.localsaida = alugueis[i].local_saida;
    locaisInfo.acess = alugueis[i].acessorio;
    teste.push(locaisInfo);
  }

  }
  console.log('--------------');
  console.log(teste);
  res.render('acompanhamento', { title: 'Acompanhamento', ...req.session,teste,nome });
  });
});

router.get('/acompmaster',auth.isAuthenticated, function(req, res, next) {
  res.render('acompmaster', { title: 'Acompanhamento Master', ...req.session });
});
router.post('/acompmirante', function(req, res, next) {
   req.session.unidade="Mirante";
   console.log(req.session.unidade);
       res.redirect(`/acompanhamento`);
     });

router.post('/acompmatriz', function(req, res, next) {
  req.session.unidade="Matriz";
  res.redirect(`/acompanhamento`);
         });

 router.post('/encerrar1/:locais_id', function(req, res, next) {
const locais = req.params.locais_id;
Aluguel.delete(locais);
res.redirect(`/acompanhamento`);
         });

router.post('/acompvila', function(req, res, next) {
  req.session.unidade="Vila";
  console.log(req.session.unidade);
  res.redirect(`/acompanhamento`);
          });

          router.post('/deslog', function(req, res, next) {
            firebase.auth().signOut().then(function(){});
              user = null;
              req.session.logado= null;
              res.redirect(`/login`);
                     });


module.exports = router;
