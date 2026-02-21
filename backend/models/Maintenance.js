const mongoose = require('mongoose')

const maintenanceSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceType: { type: String, required: true },
  date: { type: Date, default: Date.now },
  cost: { type: Number, required: true },
  notes: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('Maintenance', maintenanceSchema)