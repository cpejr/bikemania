const mongoose = require('mongoose');

const unidadeSchema = new mongoose.Schema({

  nome: String,

}, { timestamps: true, static: false });
const UnidadeModel = mongoose.model('Unidade', unidadeSchema);

class Unidade {
  /**
   * Get all Users from database
   * @returns {Array} Array of Users
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      UnidadeModel.find({}).exec().then((results) => {
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
       UnidadeModel.findById(id).exec().then((result) => {
         resolve(result);
       }).catch((err) => {
         reject(err);
       });
     });
   }

  /**
   * Create a new User
   * @param {Object} client - User Document Data
   * @returns {string} - New User Id
   */
  static create(unidade) {
    return new Promise((resolve, reject) => {
      UnidadeModel.create(unidade).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a User
   * @param {string} id - User Id
   * @param {Object} Client - User Document Data
   * @returns {null}
   */
  static update(id, user) {
    return new Promise((resolve, reject) => {
      UnidadeModel.findByIdAndUpdate(id, client).then(() => {
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
      UnidadeModel.findOneAndDelete({_id: id}).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
   });
 }


  }
  module.exports = Unidade;
