const mongoose = require('mongoose');

const precoSchema = new mongoose.Schema({

  nome: String,
  preco: Number,
  

}, { timestamps: true, static: false });
const PrecoModel = mongoose.model('Preco', precoSchema);

class Preco {
  /**
   * Get all Users from database
   * @returns {Array} Array of Users
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      PrecoModel.find({}).exec().then((results) => {
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
      PrecoModel.findById(id).exec().then((result) => {
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
  static create(client) {
    return new Promise((resolve, reject) => {
      PrecoModel.create(client).then((result) => {
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
      PrecoModel.findByIdAndUpdate(id, client).then(() => {
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
      PrecoModel.findOneAndDelete({_id: id}).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
   });
 }

 module.exports = Preco;
