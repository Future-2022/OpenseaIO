const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userPass: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('users', UserSchema);
