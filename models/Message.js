var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Message = new Schema({

  To: String,
  From: String,
  date: { type: Date, default: Date.now },
  images: [],
  messages: []

});

module.exports = mongoose.model('Message', Message);