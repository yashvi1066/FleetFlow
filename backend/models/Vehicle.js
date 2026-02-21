const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
  model: { type: String, required: true },
  licensePlate: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Truck', 'Van', 'Bike'], required: true },
  capacity: { type: Number, required: true },
  odometer: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'On Trip', 'In Shop', 'Retired'], default: 'Available' }
}, { timestamps: true })

module.exports = mongoose.model('Vehicle', vehicleSchema)