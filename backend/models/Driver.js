const mongoose = require('mongoose')

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  license: { type: String, required: true, unique: true },
  licenseExpiry: { type: Date, required: true },
  status: { type: String, enum: ['On Duty', 'Off Duty', 'Suspended'], default: 'Off Duty' },
  safetyScore: { type: Number, default: 100 },
  tripCount: { type: Number, default: 0 },
  completedTrips: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('Driver', driverSchema)