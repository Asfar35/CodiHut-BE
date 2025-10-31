const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const userMiddleware = async (req,res,next) => {
    try{
        const  {token} = req.cookies;
        if(!token)
            throw new Error("Token is not present");
        const payload = jwt.verify(token,process.env.JWT_KEY);
        const {_id} = payload;
        if(!_id)
            throw new Error("Invalid Token");
        const result = await User.findById(_id);
        if(!result)
            throw new Error("User does not exist");

        //checking redis block list
        const isBlocked = await redisClient.exists(`token:${token}`);
        if(isBlocked)
            throw new Error("Invalid Token");
        
        req.result = result;
        next();
    }
    catch(err){
        res.status(401).send("Error: " + err);
    }

}
module.exports = userMiddleware;