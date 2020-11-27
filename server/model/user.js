const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config =  require(`../config`).get(process.env.NODE_ENV);
const SALT_I=10;

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        required:true,
        minlenght:6
    },
  

    firstname:{
        type:String,
        maxlenght:100
    },
   
    lastname:{
        type:String,
        maxlenght:100
    },
   
    token:{
        type:String
    }
})
userSchema.pre('save',function(next){
    var user = this;
    
    if (user.isModified('password')){

        bcrypt.genSalt(SALT_I,function(err,salt){
            if(err) return next(err);
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password=hash;
                next();
            })
        })
    }else{
        next();
    }
})


userSchema.methods.comparePassword = function(candidatePassword,cb){
    bcrypt.compare(candidatePassword,this.password,function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch);
    })
}

userSchema.methods.generateToken =  function(cb){
    var user = this;
    var token = jwt.sign(user._id.toHexString(),config.SECRET);
    user.token = token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user)
    })
}
//decode the token given by user by jwt
userSchema.statics.findByToken = function(token,cb){
    const user = this;
    jwt.verify(token,config.SECRET,function(err,decode){ //decode contains the user id if token is correct
        user.findOne({"_id":decode,"token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user) // if token is correct it returns all user information
        })

    })
}
userSchema.methods.deleteToken = function(token,cb){
    var user = this;

    user.update({$unset:{token:1}},(err,user)=>{
        if(err) return cb(err);
        cb(null,user)
    })
}


const User = mongoose.model('User',userSchema)


module.exports = { User }


