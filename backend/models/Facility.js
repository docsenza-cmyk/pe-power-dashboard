const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Boiler Room"
  description: String,
  location: String
}, { timestamps: true });

module.exports = mongoose.model('Facility', facilitySchema);