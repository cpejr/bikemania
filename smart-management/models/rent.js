const mongoose = require('mongoose');

const rentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  quantity: Number,
  equipament: {
    type: String,
    default: "off"
  },
  equipament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipament'
  },
  status: {
    type: String,
    default: "Rodando"
  },

  startTime: String,
  startHour: String,
  endTime: String,
  endHour: String,
  totalTime: String,

  day: String,
  month: String,
  year: String,

  price: String,

  startLocal: String,
  endLocal: String,
  payment: String
}, { timestamps: true, static: false });
const RentModel = mongoose.model('Rent', rentSchema);

class Rent {
  /**
   * Get all Rent from database
   * @returns {Array} Array of Users
   */
  static getAll() {
    return new Promise((resolve, reject) => {
        RentModel.find({}).exec().then((results) => {
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
        RentModel.findById(id).populate('client').populate('equipament').exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Create a new User
   * @param {Object} rent - User Document Data
   * @returns {string} - New User Id
   */
  static create(rent) {
    return new Promise((resolve, reject) => {
        RentModel.create(rent).then((result) => {
        resolve(result._id);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Update a Rent
   * @param {string} id - rent Id
   * @param {Object} rent - rent Document Data
   * @returns {null}
   */
  static update(id, rent) {
    return new Promise((resolve, reject) => {
        RentModel.findByIdAndUpdate(id, rent).then(() => {
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
        RentModel.findOneAndDelete({_id: id}).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
   });
 }

 static getAllByStartLocal(value) {
  return new Promise((resolve, reject) => {
    RentModel.find({ startLocal: value }).populate('client').populate('equipament').exec().then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
    });
  }
}
  module.exports = Rent;
