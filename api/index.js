require('dotenv').config()

const express=require('express');
const cors=require('cors');
const app=express();
const jwt = require('jsonwebtoken');

const bcrypt=require('bcryptjs')
const mongoose=require('mongoose')
const bcryptSalt= bcrypt.genSaltSync(10);
const User=require('./models/User.js');
const cookieParser=require('cookie-parser');
const url=process.env.MONGO_URL;
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';

//Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than 
//its own from which a browser should permit loading resources

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin:'http://localhost:5173',
}));
// app.use(cors());
  
//iNWfm8UncuuGqCeD

app.get('/test',(req,res)=>
{  
  mongoose.connect(process.env.MONGO_URL);

    res.json('test ok');

});
app.post('/register', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  // res.json('register ok');
  const {name,email,password} = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password:bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }

});
app.post('/login', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {email,password} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id,
       }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
});

app.get('/profile', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const {name,email,_id} = await User.findById(userData.id);
      res.json({name,email,_id});
    });
  } else {
    res.json(null);
  }
});
app.post('/logout',(req,res)=>
{
  res.cookie('token','').json(true);
});

app.listen(4000,()=>
{
  console.log("Started");
});