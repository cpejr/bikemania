const mongoose = require('mongoose');

const alugadoSchema = new mongoose.Schema({
  pagamento: String,
  dia: Number,
  mes: Number,
  ano: Number,
  tempo: Number,
  preco: Number,
  horarioretirada: String,
  eq: String,
  nome: String,
  horariochegada: String,
  /*horario_chegada:{
    hora:Number,
    minuto:Number
  },*/
  _cpf: Number,
  localsaida: String,
  //nome: String,
  acess:{
    type:Boolean,
    default: 0
  }  //tem ou nao tem


}, { timestamps: true, static: false });
const AlugadoModel = mongoose.model('Alugado', alugadoSchema);

class Alugado {
  /**
   * Get all Aluguel from database
   * @returns {Array} Array of Users
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      AlugadoModel.find({}).exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a User by it's id
   * @param {string} id - User Id
   * @returns {Object} - User Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      AlugadoModel.findById(id).exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new User
   * @param {Object} aluguel - User Document Data
   * @returns {string} - New User Id
   */
  static create(aluguel) {
    return new Promise((resolve, reject) => {
      AlugadoModel.create(aluguel).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a Aluguel
   * @param {string} id - Aluguel Id
   * @param {Object} Aluguel - Aluguel Document Data
   * @returns {null}
   */
  static update(id, aluguel) {
    return new Promise((resolve, reject) => {
      AlugadoModel.findByIdAndUpdate(id, aluguel).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }
  static getAllByDay(dia,mes,ano) {
    return new Promise((resolve, reject) => {
      AlugadoModel.find({ dia: dia, mes: mes, ano:ano }).then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static async getAllByMonth(mes,ano) {
    var relmes = [];
    var cartao=0;
    var dinheiro=0;
    var precott=0;
    var tempott=0;
    var quant = 0;
    var dia = 0;
    for(let m = 1; m < 32; m++){

    let alugados = await Alugado.getAllByDay(m,mes,ano);
    //    console.log(m);

    for(var i = 0; i < alugados.length; i++) {

        const alugadim = {
          dia: Number,
          tempo: Number,
          preco: Number,
          pagamento: String
        }

        alugadim.dia = alugados[i].dia;
        alugadim.preco = alugados[i].preco;
        alugadim.tempo = alugados[i].tempo;
        alugadim.pagamento = alugados[i].pagamento;
  //console.log(alugadim);
        if(alugadim.pagamento == "Cartao"){
          cartao++;
        }
        else{
          dinheiro++;
        }
        precott=precott+alugadim.preco;
        tempott=tempott+alugadim.tempo;


      }
      quant = alugados.length;

    //  dia = alugadim.dia;
    //  console.log(quant);

    const dia = {
      day: Number,
      tempo: Number,
      preco: Number,
      cartao: Number,
      quantidade: Number,
      dinheiro: Number
    }
    dia.quantidade = quant;
    dia.day = m;
    dia.tempo = tempott;
    dia.preco = precott;
    dia.cartao = cartao;
    dia.dinheiro = dinheiro;
    //console.log(dia);
  //  console.log(dia.day);
  //  console.log(dia.preco);
  //  console.log(dia.quantidade);
    relmes.push(dia);
    tempott = 0;
    precott=0;
    cartao=0;
    dinheiro=0;
    //console.log(relmes[j].quantidade);
    //console.log(relmes);
  }

    console.log(relmes);
    return (relmes);

  }

  /**
  * Delete a User
  * @param {string} id - User Id
  * @returns {null}
  */

  static delete(id) {
    return new Promise((resolve, reject) => {
      AlugadoModel.findOneAndDelete({_id: id}).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
   });
 }

 /**
  * Get a User by it's id
  * @param {string} id - User Id
  * @returns {Object} - User Document Data
  */
 static getByCpf(cpf) {
   return new Promise((resolve, reject) => {
     AlugadoModel.findByCpf(cpf).exec().then((result) => {
       resolve(result);
     }).catch((err) => {
       reject(err);
     });
   });
 }


  }
  module.exports = Alugado;
