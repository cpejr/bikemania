const mongoose = require('mongoose');

const rentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  quantity: Number,
  remainingQuantity: Number,
  accessory: {
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

  receivedPrice: {
    type: Number,
    default: 0
  },
  startLocal: String,
  endLocal: String,
  payment: String,
}, { timestamps: true, static: false });
const RentModel = mongoose.model('Rent', rentSchema);

class Rent {
  /**
   * Get all Rent from database
   * @returns {Array} Array of rents
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
   * @returns {Object} - rent Document Data
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
   * Create a new rent
   * @param {Object} rent - rent Document Data
   * @returns {string} - New rent Id
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
  * Delete a rent
  * @param {string} id - rent Id
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
    RentModel.find({ startLocal: value , status:"Rodando" }).populate('client').populate('equipament').exec().then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
    });
  }

  static getAllByDate(day, month, year) {
    return new Promise((resolve, reject) => {
      RentModel.find({ day: day , month: month, year: year, status: "Finalizado" }).populate('client').populate('equipament').exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static getAllByMonth(month, year) {
    return new Promise((resolve, reject) => {
      RentModel.find({ month: month, year: year, status: "Finalizado" }).populate('client').populate('equipament').exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static getAllByDateAndStartLocal(startLocal, day, month, year) {
    return new Promise((resolve, reject) => {
      RentModel.find({startLocal: startLocal, day: day , month: month, year: year, status: "Finalizado" }).populate('client').populate('equipament').exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static getAllByMonthAndStartLocal(startLocal, month, year) {
    return new Promise((resolve, reject) => {
      RentModel.find({startLocal: startLocal, month: month, year: year, status: "Finalizado" }).populate('client').populate('equipament').exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}
  module.exports = Rent;