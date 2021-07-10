const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const employeeSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    confirmPassword:{
        type:String
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

// generating tokens
employeeSchema.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        console.log(token);
        return token;
    } catch (error) {
        res.send(`the error part ` +error);
    }
}

employeeSchema.pre("save",async function(next){
    if(this.isModified("password")){
        // const passwordHash = await bcypt.hash(password,10);
        this.password = await bcrypt.hash(this.password,10)
        console.log(this.password);
    }
    
    next();
})

// now we need to create a collection

const Register = new mongoose.model("Register",employeeSchema);
module.exports = Register