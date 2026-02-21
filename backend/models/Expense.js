const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  liters: { type: Number, required: true },
  fuelCost: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Expense', expenseSchema)
