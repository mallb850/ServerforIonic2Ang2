var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var User = new Schema({
     
      email: {
        type: String,
        unique: true,
        required: true
      },
      username: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      followers: [String],
      following: [String],
      items: []
});


// Hashing password

User.pre('save', function(next) {
  var user = this;
  if(this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function(err, salt) {
      if(err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function(err, hash) {
        if(err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } 
  else {
    return next();
  }
});

User.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if(err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', User);