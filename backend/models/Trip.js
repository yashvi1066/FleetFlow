const mongoose = require('mongoose')

const tripSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  cargoWeight: { type: Number, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  estimatedFuelCost: { type: Number, default: 0 },
  finalOdometer: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'], default: 'Draft' }
}, { timestamps: true })

module.exports = mongoose.model('Trip', tripSchema)