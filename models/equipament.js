const mongoose = require('mongoose');

const equipamentSchema = new mongoose.Schema({
  name: String,
  price: Number,
  rents: Number
}, { timestamps: true, static: false });


const EquipamentModel = mongoose.model('Equipament', equipamentSchema);

class Equipament {
  /**
   * Get all accessories from database
   * @returns {Array} Array of accessories
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      EquipamentModel.find({}).exec().then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static getByName(name) {
    return new Promise((resolve, reject) => {
      EquipamentModel.findOne({name: name}).exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static getByNameI(name, i) {
    return new Promise((resolve, reject) => {
      EquipamentModel.findOne({name: name}).exec().then((result) => {
        result.i = i;
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a equipament by it's id
   * @param {string} id - equipament Id
   * @returns {Object} - equipament Document Data
   */
  static getById(id) {
    return new Promise((resolve, reject) => {
      EquipamentModel.findById(id).exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new equipament
   * @param {Object} equipament - equipament Document Data
   * @returns {string} - New equipament Id
   */
  static create(Equipament) {
    return new Promise((resolve, reject) => {
      EquipamentModel.create(Equipament).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a equipament
   * @param {string} id - equipament Id
   * @param {Object} equipament - equipament Document Data
   * @returns {null}
   */
  static update(id, equipament) {
    return new Promise((resolve, reject) => {
      EquipamentModel.findByIdAndUpdate(id, equipament).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
  * Delete a equipament
  * @param {string} id - equipament Id
  * @returns {null}
  */

  static delete(id) {
    return new Promise((resolve, reject) => {
      EquipamentModel.findOneAndDelete({_id: id}).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
   });
 }

  /**
   * Get a equipament by it's uid
   * @param {string} id - equipament Uid
   * @returns {Object} - equipament Document Data
   */
  static getByUid(id) {
    return new Promise((resolve, reject) => {
      EquipamentModel.findOne({ uid: id }).exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }


  }


module.exports = Equipament;
