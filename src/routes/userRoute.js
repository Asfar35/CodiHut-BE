const express = require("express");
const authRouter = express.Router();
const {register, adminRegister, login, logout, deleteProfile} = require("../controllers/userAutent");
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require("../middleware/adminMiddleware");

//Register
authRouter.post("/register",register);
authRouter.post("/admin/register",adminMiddleware,adminRegister);
//Login
authRouter.post("/login",login);
//Logout
authRouter.post("/logout",userMiddleware,logout);
//Delete User
authRouter.delete("/deleteProfile",userMiddleware,deleteProfile);

authRouter.get("/check",userMiddleware, (req, res)=>{
    res.status(200).json({
        user: {firstName: req.result.firstName, emailId: req.result.emailId, _id: req.result._id},
        message: "Valid User"
    })
})
//Get Profile
// authRouter.get("/getprofile",getprofile);

module.exports = authRouter;