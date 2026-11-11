const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },

  // Dynamic values object - this will store all your custom parameters
  values: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,   // Allows numbers, strings, booleans, dates, etc.
    default: {}
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fast queries
parameterSchema.index({ equipmentId: 1, timestamp: -1 });

module.exports = mongoose.model('Parameter', parameterSchema);