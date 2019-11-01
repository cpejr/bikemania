var express = require('express');
var firebase = require('firebase');
var router = express.Router();
module.exports = {
// Essa função confere se o usuário está logado antes de entrar nas páginas
// A const user pega as informações do usuário que está logado no firebase e compara com o usuário que quer acessar as páginas
// Caso não haja nenhum usuário logado, a página é redirecionada para o login. Caso haja um usuário logado, a página que o usuário quer acessar é carregada
  isAuthenticated: (req, res, next) => {
    const user = firebase.auth().currentUser;
    if(user!== null){
      next();
    }
    else {
      res.redirect('/login');
    }
  },
}
