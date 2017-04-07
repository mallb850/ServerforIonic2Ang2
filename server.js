var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cors = require('cors');
var passport = require('passport');
var jwt = require('jwt-simple');
var User = require('../server/models/User');
var Item = require('../server/models/Item');
var actions = require('../server/actions/methods');
var Schema = mongoose.Schema;

// Configuration

mongoose.connect('mongodb://localhost/joeShop');

app.use(function(req,res,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST, OPTIONS, DETELE');
  res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));
app.use(methodOverride());
app.use(cors());
app.use(passport.initialize());








// Routes

    //Get reviews
    app.get('/api/items', function(req,res) {
      console.log('Getting Items');

    //Get all Items using mongoose
      Item.find(function(err, items) {
        if(err){
          res.send(err);
        }
        else {
          res.json(items);
        }
      });

  });




  //Create Item and send back all Items

  app.post('/authenticate', actions.authenticate);

  app.post('/api/items', function(req,res) {
    console.log("Creating Item");

    Item.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      date: req.body.date,
      image: req.body.image,
      done: false
    }, function(err, item) {
      if(err)
        res.send(err);

        //get and return all the items after Create
        Item.find(function(err,items) {
          if(err)
          res.send(err)
          res.json(items);
        });
    });
  });

  app.delete('/api/items/:item_id', function(req,res) {
    Item.remove({
      _id: req.params.item_id
    }, function(err,review) {

    });
  });

  require('./config/passport')(passport);

  app.post('/api/signup', function(req,res) {
    if(!req.body.username || !req.body.password || !req.body.email || !req.body.password2) {
      res.json({success: false, msg: "Please enter all information"});
    }
    else {
      var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2

      });
      newUser.save(function(err) {
        if(err) {
          res.json({success: false, msg:"Username already exists."});
        }
        else {
          res.json({success: true, msg: "User Created Successful"});
        }
      });
    }
  });
 

  //listen
  app.listen(8080);
  console.log('App listening on port 8080');
