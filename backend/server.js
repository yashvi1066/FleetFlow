const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes (we'll uncomment these as we build them)
app.use('/api/auth', require('./routes/auth'))
// app.use('/api/vehicles', require('./routes/vehicles'))
// app.use('/api/drivers', require('./routes/drivers'))
// app.use('/api/trips', require('./routes/trips'))
// app.use('/api/maintenance', require('./routes/maintenance'))
// app.use('/api/expenses', require('./routes/expenses'))
// app.use('/api/analytics', require('./routes/analytics'))

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'FleetFlow API Running' })
})

// Connect MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected')
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`)
    })
  })
  .catch(err => {
    console.log('❌ MongoDB Error:', err)
  })