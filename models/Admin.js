const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  adminEmail: {
    type: String,
    required: true,
    unique: true
  },
  adminPass: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('admins', AdminSchema);
