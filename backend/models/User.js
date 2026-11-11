const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // hashed - only for email/password login
  name: { type: String },
  role: { 
    type: String, 
    enum: ['admin', 'user'], 
    default: 'user' 
  },
  assignedFacilities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' }],
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);