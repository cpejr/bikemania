const mongoose = require('mongoose');

const rentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  cpf: {
    type: String,
  },
  quantity: Number,
  remainingQuantity: Number,
  accessory: Number,
  equipament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipament'
  },
  status: {
    type: String,
    default: "Rodando"
  },
  statusredirect: String,
  startTime: String,
  startHour: String,
  endTime: String,
  endHour: String,
  totalTime: String,
  day: String,
  month: String,
  year: String,
  partialPrice: Number,
  receivedPrice: {
    type: Number,
    default: 0
  },
  startLocal: String,
  endLocal: String,
  payment: String,
  sale: {
    type: String,
    default: "Desativado"
  },
  discount: Number,
  justification: {
    type: String,
    default: "Não há justificativa"
  },
  hasDiscount: {
    type: String,
    default: "Não"
  },
  atualization: {
    type: String,
    default: "Não atualizado"
  }

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
    RentModel.find({ startLocal: value , status:"Rodando"}).populate('client').populate('equipament').exec().then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
    });
  }

  static getAllByEndLocalWaiting(value) {
    return new Promise((resolve, reject) => {
      RentModel.find({ endLocal: value , status:"Aguardando Pagamento" }).populate('client').populate('equipament').exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
      });
    }

  static getAllByEndLocal(value) {
    return new Promise((resolve, reject) => {
      RentModel.find({ endLocal: value , status:"Finalizado" }).populate('client').populate('equipament').exec().then((result) => {
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

  static getAllByDateAndEndLocal(endLocal, day, month, year) {
    return new Promise((resolve, reject) => {
      RentModel.find({endLocal: endLocal, day: day , month: month, year: year, status: "Finalizado" }).populate('client').populate('equipament').exec().then((result) => {
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

  static getByCpf(cpf) {
    return new Promise((resolve, reject) => {
    RentModel.find({cpf: cpf}).populate('client').populate('equipament').exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  
  static getAllByMonthAndEndLocal(endLocal, month, year) {
    return new Promise((resolve, reject) => {
      RentModel.find({endLocal: endLocal, month: month, year: year, status: "Finalizado" }).populate('client').populate('equipament').exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static getAllByStatusAguardando(cpf, endLocal) {
    return new Promise((resolve, reject) => {
      RentModel.find({cpf: cpf, endLocal: endLocal, status: "Aguardando pagamento"}).populate('client').populate('equipament').exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static getAllByStatusRodando(cpf, endLocal) {
    return new Promise((resolve, reject) => {
      RentModel.find({cpf: cpf, endLocal: endLocal, status: "Rodando" }).populate('client').populate('equipament').exec().then((result) => {
        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  
}
  module.exports = Rent;
