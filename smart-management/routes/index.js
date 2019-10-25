var express = require('express');
var router = express.Router();
var firebase = require('firebase');
const mongo = require('../models/user');
const auth = require('./middleware/auth');
const Client = require('../models/client');

/* GET home page. */
router.get('/home',auth.isAuthenticated, function(req, res, next) {
  res.render('home', { title: 'Home' });
});
router.get('/homemaster',auth.isAuthenticated, function(req, res, next) {
  res.render('homemaster', { title: 'Home' });
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
  if(tipo==1){
      res.redirect('/acompmaster');
}
  else{
    res.redirect('/acompanhamento')
  }
});
var tipo;
router.post('/login', function(req, res, next) {
  const user=req.body.user;
  firebase.auth().signInWithEmailAndPassword(user.username, user.password).then((userF)=>{
    mongo.getByUid(userF.user.uid).then((result)=> {
      if(result.type=='Master'){
      tipo=1;
        res.redirect('/acompmaster');
      }
      else{
        tipo=0;
        res.redirect('/acompanhamento');
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
  res.render('acompanhamento', { title: 'Acompanhamento Matriz',layout: 'layout' });
});
router.get('/acompmaster', auth.isAuthenticated,function(req, res, next) {
  res.render('acompmaster', { title: 'Acompanhamento Matriz' });
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
