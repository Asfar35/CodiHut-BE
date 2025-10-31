const validator = require("validator");
const validate = (data) => {
    const mandetoryField = ["firstName","emailId","password"];
    const isAllowed = mandetoryField.every(key => Object.keys(data).includes(key));

    if(!isAllowed) 
        throw new Error("Some field is missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");
    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password");
    
}
module.exports = validate;