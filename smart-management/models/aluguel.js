const mongoose = require('mongoose');

const aluguelSchema = new mongoose.Schema({
  tempo: Number,
  preço: Number,
  horario_retirada: String,
  equipamento: String,
  horario_chegada: String,
  /*horario_chegada:{
    hora:Number,
    minuto:Number
  },*/
  cpf: Number,
  local_saida: String,
  //nome: String,
  acessorio:{
    type:Boolean,
    default: 0

  }  //tem ou nao tem



}, { timestamps: true, static: false });
const AluguelModel = mongoose.model('Aluguel', aluguelSchema);

class Aluguel {
  /**
   * Get all Aluguel from database
   * @returns {Array} Array of Users
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      AluguelModel.find({}).exec().then((results) => {
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
      AluguelModel.findById(id).exec().then((result) => {
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
      AluguelModel.create(aluguel).then((result) => {
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
      AluguelModel.findByIdAndUpdate(id, aluguel).then(() => {
        resolve();
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
      AluguelModel.findOneAndDelete({_id: id}).then(() => {
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
 


  }
  module.exports = Aluguel;
