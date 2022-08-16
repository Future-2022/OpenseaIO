const mongoose = require('mongoose');
const db = 'mongodb://localhost:27017/safemoon';
const connectDB = async () => {
  mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true
  });
  mongoose.connection.on('connected', () => {
      console.log('Connected to MongoDB');
  });
  mongoose.connection.on('error', (error) => {
      console.log(error);
  });
};

module.exports = connectDB;
