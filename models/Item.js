var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Item = new Schema({

  title: String,
  description: String,
  price: Number,
  brand: String,
  size: Number,
  type: String,
  condition: String,
  date: { type: Date, default: Date.now },
  image: String,
  seller: String

});

module.exports = mongoose.model('Item', Item);