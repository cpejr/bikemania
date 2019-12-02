const mongoose = require('mongoose');

const precoSchema = new mongoose.Schema({

  nome: String,
  preco: Number

}, { timestamps: true, static: false });


const PrecoModel = mongoose.model('Preco', precoSchema);

class Preco {
  /**
   * Get all Precos from database
   * @returns {Array} Array of Precos
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
   * Get a Preco by it's id
   * @param {string} id - Preco Id
   * @returns {Object} - Preco Document Data
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
   * Create a new Preco
   * @param {Object} Preco - Preco Document Data
   * @returns {string} - New Preco Id
   */
  static create(Preco) {
    return new Promise((resolve, reject) => {
      PrecoModel.create(Preco).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a Preco
   * @param {string} id - Preco Id
   * @param {Object} Preco - Preco Document Data
   * @returns {null}
   */
  static update(id, Preco) {
    return new Promise((resolve, reject) => {
      PrecoModel.findByIdAndUpdate(id, Preco).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
  * Delete a Preco
  * @param {string} id - Preco Id
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

  /**
   * Get a Preco by it's uid
   * @param {string} id - Preco Uid
   * @returns {Object} - Preco Document Data
   */
  static getByUid(id) {
    return new Promise((resolve, reject) => {
      PrecoModel.findOne({ uid: id }).exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }


  }


module.exports = Preco;
