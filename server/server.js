const express = require('express')
 const app = express()
 const mongoose = require('mongoose');
 const cookieParser = require('cookie-parser');
const server = require('http').Server(app)
const bodyParser = require('body-parser');
const config = require(`./config`).get(process.env.NODE_ENV);
var session = require('express-session')
mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE)
const { User } = require('./model/user');
const { auth } = require('./middleware/auth');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('secret'))
app.use(session({cookie: {maxAge: null}}))

app.use(express.static('public'))

app.use((req, res, next)=>{
  res.locals.message = req.session.message
  delete req.session.message
  next()
})

const handlebars = require('express3-handlebars').create()
app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')

app.get('/',(req,res)=>{
  res.render('dashboard')
})



app.get('/room',auth, (req, res) => {
 if(req.token == undefined){
   res.redirect('/login')
 }else{
   res.render('room')
 }
})



app.post('/join',auth,(req,res)=>{
  res.redirect(`/room/${req.body.roomId}`)
})

app.get('/register',(req,res)=>{
  res.render('register')
})

app.get('/login',(req,res)=>{
  res.render('login')
})

app.post('/register',(req,res)=>{
   const user = new User({
     email:req.body.email,
     password : req.body.password,
      firstname : req.body.firstname,
     lastname:req.body.lastname
   })
   
 user.save((err,doc)=>{
      if(err) return res.json({
          success:false
      });
      res.redirect(`/login`)
  })
})

app.post('/login',(req,res)=>{
 
  
  User.findOne({'email':req.body.email},(err,user)=>{
   if(!user){
    req.session.message = {
      type: 'danger',
      intro: 'Email not Found ',
      message: 'Please enter the correct email'
    }
    res.redirect('/login')
  }
  else if (user){
 user.comparePassword(req.body.password,(err,isMatch)=>{
      if(!isMatch){
        req.session.message = {
            type: 'danger',
            intro: 'Passwords do not match! ',
            message: 'Please make sure to insert the same password.'
          }
          res.redirect('/login')
         }
       else{
  user.generateToken((err,user)=>{
      if(err) return res.status(400).send(err);
      res.cookie('auth',user.token).render('dashboard')
   })
  }
})
} 
})
})

app.get('/logout',auth,(req,res)=>{
  if(req.token == undefined){
    return res.redirect('/')
  }else{
 req.user.deleteToken(req.token,(err,user)=>{
      if(err) return res.status(400).send(err);
      res.render('logout')
 })
}
})

server.listen(process.env.PORT||3030)






















