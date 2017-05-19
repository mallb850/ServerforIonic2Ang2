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
var Message = require('../server/models/Message');
var actions = require('../server/actions/methods');
var cloudinary = require('cloudinary');
let http = require('http').Server(app); 
let io = require('socket.io')(http);
var Schema = mongoose.Schema;
var config = require('../server/config/database.json');
var cloudconfig = require('../server/config/cloudinary.json');




// Configuration

mongoose.connect(config.uri);


app.all(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
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


cloudinary.config({ 
  cloud_name: cloudconfig.cloudname, 
  api_key: cloudconfig.apikey, 
  api_secret: cloudconfig.apisecret 
});


// Socket.io 

io.on('connection', (socket) => { 
  
  console.log('user connected'); 


  socket.on('disconnect', function() { 
    console.log('user disconnected'); 
  }); 
  
  
  socket.on('add-message', (message) => { 
    io.emit('message', {type:'new-message', text: message}); 
  }); 
});


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

  app.get('/api/allUsers', function(req,res) {
    User.find(function(err,users) {
      if(err){
        res.send(err);
        console.log("Error");
      }
      else {
        res.json(users);
      }
    });
  });

  //Create Item and send back all Items

  app.post('/authenticate', actions.authenticate);

  // Create Message

  app.post('/api/messages', function(req,res) {

    Message.create({
      To: req.body.to,
      From: req.body.from,
      date: req.body.date,
      images: req.body.images,
      messages: req.body.messages
    }, function(err, message) {
      if(err)
        
        res.send(err);
      
        User.findOneAndUpdate({
          username: req.body.seller
        }, 
        
        {$push: {messages: message}},
        {safe: true, upsert: true}, 
        
        function(err, message) {
        
          if(err){
            console.log(err);
            res.send(err);
          }

        User.findOneAndUpdate({
          username: req.body.user
        },

        {$push: {messages: message}},
        {safe: true, upsert: true}, 
        
        function(err, message) {
          
          if(err){
            console.log(err);
            res.send(err);
          }

          else {
            console.log("Messages successfully created and added");
          }


        });
      })
   })
 })

  app.post('/api/items', function(req,res) {
    console.log("Creating Item");

    cloudinary.uploader.upload(req.body.image, function(result) { 
      console.log(result); 
    });

    Item.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      date: req.body.date,
      image: this.image,
      brand: req.body.brand,
      size: req.body.size,
      type: req.body.type,
      condition: req.body.condition,
      seller: req.body.seller,
      done: false
    }, function(err, item) {
      if(err)
        res.send(err);

        //add to user items array
        User.findOneAndUpdate({
          username: req.body.seller
        }, 
        {$push: {items: item}},
        {safe: true, upsert: true}, 
        
        function(err, user) {
          if(err){
            console.log(err);
            res.send(err);
          }
          else {
            console.log("Successfully added item to user");
          }

        });

    });
  });



  app.post('/api/userprofile', function(req,res) {
      User.findOne({
        username: req.body.username
      }, function(err, user ) {
        if(err) {
          console.log(err);
        }
        else {
          res.json(user);
          console.log(user);
        };
      });
  });


  app.post('/api/following', function(req,res) {
      
      
      User.findOneAndUpdate({
         username: req.body.username  
      },
        {"$push": {following: req.body.seller}},
        
        function(err, user) {

        if(err) {
          res.json({success: false, msg:"Error, Please Try Again"});
        }

        else {
          res.json({success: true, msg:"You are now following " + req.body.seller});
        }
      } 
    );

  });

  app.post('/api/follower', function(req,res) {
    
     User.findOneAndUpdate({
         username: req.body.seller  
      },
        {"$push": {followers: req.body.username}},
        
        function(err, user) {
        
        if(err) {
          res.json({success: false, msg:"Error, Please Try Again"});
        }
        
        else {
          res.json({success: true, msg: req.body.follower + "started following you"});
        }
      } 
    );

  });



  app.post('/api/useritems', function(req,res) {

    Item.find({
      seller: req.body.seller
    }, function(err, items) {
        if(err){
          throw err;
        }
        else {
          res.json(items);
        }
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
            res.json({success: false, msg:"Email or Username already exists."});
            console.log(err);
          }
          else {
            res.json({success: true, msg: "User Created Successful"});
          }
        });
    }
  });
 

  //listen
  app.listen(8080, () => {
    console.log('KickPusherz listening on port 8080');
  });
  
