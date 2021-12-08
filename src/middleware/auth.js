const jwt = require('jsonwebtoken')
const User = require('../models/users')

const auth = async (req,res,next) =>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const verify = jwt.verify(token,JWT_SECRET)
        const user = await User.findOne({ _id : verify._id , "tokens.token" :  token })
        
        if(!user){
            res.status(401).send({"error" : "please authenticate s"})
        }

        req.token = token 
        req.user = user
        next()

    }catch(error){
        res.status(401).send({"error" : "please authenticate"})
    }

}

module.exports = auth 