const mongoose = require('mongoose');

const StakeSchema = new mongoose.Schema({
  stakeIndex: {
    type: Number,
    // required: true
  },
  userPass: {
    type: String,
    required: true
  },
  endDate: {
    type: Date,
  },
  stakeAmount: {
    type: Number
  },
  newFlag: {
    type: Boolean
  },
  waitStatus: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('stake', StakeSchema);
