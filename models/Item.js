var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Item = new Schema({

  title: String,
  description: String,
  price: Number,
  date: { type: Date, default: Date.now },
  image: String

});

module.exports = mongoose.model('Item', Item);