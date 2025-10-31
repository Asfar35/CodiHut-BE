const redisClient = require("../config/redis");
const Submission = require("../models/submission");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//register
const register = async (req,res) => {
    try{
        //validate the data
        validate(req.body);

        const {firstName,emailID,password} = req.body;

        // const isExist = User.exists({emailId}); //does not require because emailId is already unique
        req.body.password = await bcrypt.hash(password,10);
        req.body.role = "user";


        const user = await User.create(req.body);
        const token = jwt.sign({_id:user._id,emailID: emailID, role: user.role},process.env.JWT_KEY,{expiresIn: 60*60});// for key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        res.cookie("token",token,{maxAge: 60*60*1000});
        res.status(201).json({
            user: {firstName: firstName, emailId: emailID, _id: user._id},
            message: "user registered successfully."
        })  
    }
    catch(err){
        res.status(400).send("Error: " + err);
    }
}

const adminRegister = async (req,res) => {
        try{
        //validate the data
        validate(req.body);

        const {firstName,emailID,password} = req.body;

        // const isExist = User.exists({emailId}); //does not require because emailId is already unique
        req.body.password = await bcrypt.hash(password,10);


        const user = await User.create(req.body);
        const token = jwt.sign({_id:user._id,emailID: emailID, role: user.role},process.env.JWT_KEY,{expiresIn: 60*60});// for key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        res.cookie("token",token,{maxAge: 60*60*1000});
        res.status(201).send("user registered successfully.");
    }
    catch(err){
        res.status(400).send("Error: " + err);
    }
}

//login
const login = async (req, res)=>{
    try{
        const {emailId,password} = req.body;
        if(!emailId)
            throw new Error("Invalid credentials...");
        if(!password)
            throw new Error("Invalid credentials...");

        const user = await User.findOne({emailId});
        const match = bcrypt.compare(password, user.password);
        if(!match)
            throw new Error("Invalid credentials...");
        const token = jwt.sign({_id:user._id,emailID: emailId, role: user.role},process.env.JWT_KEY,{expiresIn: 60*60});// for key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        res.cookie("token",token,{maxAge: 60*60*1000});

        res.status(201).json({
            user: {firstName: req.result.firstName, emailId: req.result.emailId, _id: req.result._id},
            message: "Logged in successfully"
        })
    }
    catch(err){
        res.status(401).send("Error: " + err);
    }
}

//logout
const logout = async (req, res) => {
    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,"Blocked");
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null,{expires : new Date(Date.now())});
        res.send("User Logout Successfully");
    }
    catch(err){
        res.status(503).send("Error: " + err);
    }
    

}

//delete Profile
const deleteProfile = async (req, res) =>{
    try{
        const userId = req.result._id;
        // deleted user
        await User.findByIdAndDelete(userId);
        //deleted from submission schema
        // await Submission.deleteMany({userId});

        res.status(200).send("Deleted successfully...");
    }
    catch(err){
        res.status(500).send("Internal server Error: " + err);
    }
}
module.exports = {register, login, logout, adminRegister, deleteProfile};