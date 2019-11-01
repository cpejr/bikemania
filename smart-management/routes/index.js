var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const mongo = require('../models/user');
const auth = require('./middleware/auth');
const Client = require('../models/client');

/* GET home page. */
router.get('/home',auth.isAuthenticated, function(req, res, next) {
  res.render('home', { title: 'Home' , ...req.session});
});
router.get('/homemaster',auth.isAuthenticated, function(req, res, next) {
  res.render('homemaster', { title: 'Home', ...req.session });
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

router.get('/login', function(req, res, next) {
  res.render('index', { title: 'Login' });
});
router.get('/novoaluguel', auth.isAuthenticated,function(req, res, next) {
  res.render('novoaluguel', { title: 'Novo Aluguel' });
});
router.post('/novoaluguel', function(req, res, next) {

  if(req.session.logado.type=='Master'){
    res.redirect('/acompmaster');
  }
  else{
    res.redirect('/acompanhamento')
  }
 });
 router.post('/acompmirante', function(req, res, next) {
   // const  unidade  = "Mirante";
   //   Unidade.getById("5db8a9261c9d4400008a877a").then((result) => {
   //    console.log(result);
   //    console.log("oooi")
   //    req.session.unidade=result.uni;
   req.session.unidade="Mirante";
   console.log(req.session.unidade);
       res.redirect(`/acompanhamento`);
     });
     router.post('/deslog', function(req, res, next) {
       user = null;
       req.session.logado= null;

       res.redirect(`/login`);
              });
router.post('/acompmatriz', function(req, res, next) {
  req.session.unidade="Matriz";
  console.log(req.session.unidade);
  res.redirect(`/acompanhamento`);
         });

router.post('/acompvila', function(req, res, next) {
  req.session.unidade="Vila";
  console.log(req.session.unidade);
  res.redirect(`/acompanhamento`);
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
  res.render('acompanhamento', { title: 'Acompanhamento', ...req.session });
});
router.get('/acompmaster', auth.isAuthenticated,function(req, res, next) {
  res.render('acompmaster', { title: 'Acompanhamento Master', ...req.session });
});
router.get('/acompmirante',auth.isAuthenticated, function(req, res, next) {
  res.render('acompmirante', { title: 'Acompanhamento Mirante',layout: 'layout' });
});
router.get('/acompmirantemaster', auth.isAuthenticated,function(req, res, next) {
  res.render('acompmirantemaster', { title: 'Acompanhamento Mirante',layout: 'layout' });
});
router.get('/acompvila',auth.isAuthenticated, function(req, res, next) {
  res.render('acompvila', { title: 'Acompanhamento Vila',layout: 'layout' });
});
router.get('/acompvilamaster', auth.isAuthenticated,function(req, res, next) {
  res.render('acompvilamaster', { title: 'Acompanhamento Vila',layout: 'layout' });
});
router.get('/relatoriomensal', auth.isAuthenticated,function(req, res, next) {
  res.render('relatoriomensal', { title: 'Relatório Mensal',layout: 'layout' });
});
router.get('/relatoriodiario',auth.isAuthenticated, function(req, res, next) {
  res.render('relatoriodiario', { title: 'Relatório Diário',layout: 'layout' });
});
module.exports = router;
