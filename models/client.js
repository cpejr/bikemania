const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
  },
  cpf: {
    type: String,
    required: true,
    unique: true
  },
  datePoints: [{
    type: String,
  }],
  rg: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  equipamentRents: {
    type: Number,
    default: 0
  },
}, { timestamps: true, static: false });
const ClientModel = mongoose.model('Client', clientSchema);

class Client {
  /**
   * Get all Users from database
   * @returns {Array} Array of Users
   */
  static getAll() {
    return new Promise((resolve, reject) => {
      ClientModel.find({}).exec().then((results) => {
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
      ClientModel.findById(id).exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * Get a datePoints by it's id
   * @param {string} id - User Id
   * @returns {Object} - User Document Data
   */
  static getDatePointsById(id) {
    return new Promise((resolve, reject) => {
      ClientModel.findById(id).exec().then((result) => {
        resolve(result.datePoints);
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
      ClientModel.create(client).then((result) => {
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
  static update(id, client) {
    return new Promise((resolve, reject) => {
      ClientModel.findByIdAndUpdate(id, client).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

    /**
   * Update a User dataPoints
   * @param {string} id - User Id
   * @param {Object} Client - User Document Data
   * @returns {null}
   */
  static updateDatePoints(id, datePoint) {
    return new Promise((resolve, reject) => {
      ClientModel.update({_id: id}, {$set:{datePoints: datePoint}}).then(() => {
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
      ClientModel.findOneAndDelete({_id: id}).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      });
   });
 }

 /**
   * Get a User by it's CPF
   * @param {string} cpf - User CPF
   * @returns {Object} - User Document Data
   */
 static getByCpf(cpf) {
   return new Promise((resolve, reject) => {
   ClientModel.findOne({cpf: cpf}).exec().then((result) => {
       resolve(result);
     }).catch((err) => {
       reject(err);
     });
   });
 }

 
}
module.exports = Client;
