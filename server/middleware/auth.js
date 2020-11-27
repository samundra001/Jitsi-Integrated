const { User } =require('../model/user');

let auth = (req,res,next)=>{
   
    let token = req.cookies.auth; //token is in cookie
  
  
    User.findByToken(token,(err,user)=>{ //find user according to the token
        if(err) throw err;
        if(!user) {
            res.render('login')
        }
        req.token = token;
        
        req.user = user;
        next();
     })
}

module.exports = {auth}

//auth checks wheather user want to loin or logout