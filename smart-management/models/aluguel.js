const mongoose = require('mongoose');

const aluguelSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  quantity: Number,
  equipament: String,
  accessory: String,
  status: String,
  time: Number,
  price: Number,
  startTime: String,
  endTime: String,
  startLocal: String,
  endLocal: String
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

 static getAllByUnity(value) {
  return new Promise((resolve, reject) => {
    AluguelModel.find({ startLocal: value }).populate('client').then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  });
}





  }
  module.exports = Aluguel;
