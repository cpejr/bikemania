const mongoose = require('mongoose');

const alugadoSchema = new mongoose.Schema({
  pagamento: {
    pagamento: String,
    enum:['Cartao','Dinheiro']
  },
  dia: Number,
  mes: Number,
  ano: Number,
  tempo: Number,
  preço: Number,
  horarioretirada: String,
  eq: String,
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

  static getAllByMonth(mes,ano) {
    return new Promise((resolve, reject) => {
      AlugadoModel.find({ mes: mes, ano:ano }).then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
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
