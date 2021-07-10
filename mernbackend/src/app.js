require("dotenv").config();
const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth")
require("./db/conn");
const Register = require("./models/registers")
const PORT = process.env.PORT | 3000;

// console.log(path.join(__dirname, "../public"))
const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}))

app.use(express.static(static_path))
app.set('view engine','hbs');
app.set("views",template_path);
hbs.registerPartials(partials_path);
app.get("/",(req,res)=>{
    res.render("index")
})
app.get("/secret",auth,(req,res)=>{
    console.log(`cccoookiee ${req.cookies.jwt}`);
    res.render("secret")
});
app.get("/logout",auth,async(req,res)=>{
    try {
        console.log(req.user);
        req.user.tokens = req.user.tokens.filter((currElement)=>{
            return currElement.token != req.token
        })

        // logout from all devices
        // req.user.tokens=[];
        res.clearCookie("jwt");
        console.log("Logout successfully");
        await req.user.save();
        res.render("login")
    } catch (error) {
        res.status(500).send(error);
    }
})
console.log(process.env.SECRET_KEY);

app.get("/register",(req,res)=>{
    res.render('register')
})

app.get("/login",(req,res)=>{
    res.render('login')
})

// create user in a database
app.post("/register",async(req,res)=>{
    try {
        const password = req.body.password;
        console.log(req.body.email);
        const registerEmployee = new Register({
            email:req.body.email,
            password : req.body.password
        })
        const token = await registerEmployee.generateAuthToken(); 

        // res.cookie("jwt",token,{
        //     expires: new Date(Date.now()+30000),
        //     httpOnly:true
        // });
        res.cookie("jwt",token);
        // console.log(coo)
        // password hash
        // middleware
        const registered = await registerEmployee.save();
        console.log("rrrrrrrrrrrrrrrrreeeeeeeeeeeeeeeeeeeeeeeeeeeeeqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
        console.log(req);
        console.log("uuuuuuuuuuuuusssssssssssssseeeeeeeeeeeeeeeeeeeeeeeeeeeeerrrrrrrrrrrrrrrrrrrrrrrrrr");
        let user = Register.findOne({email:req.body.email});
        req.user=user;
        console.log(req.user);
        res.status(201).render("index",{user:user});
        // res.send(req.body.email)
    } catch (error) {
        res.status(400).send(error);
    }
})

app.post("/login",async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(`${email} ${password}`)
        const userEmail =await Register.findOne({email:email});
        const isMatch = await bcrypt.compare(password,userEmail.password);

        const token = await userEmail.generateAuthToken();
        console.log(token);

        res.cookie("jwt",token,{
           // expires:Date(Date.now()+3000),
            httpOnly:true
            // secure:true
        });
        
        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("invalid login details")
        }
    } catch (error) {
        res.status(400).send("Invalid email")
    }
})

// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const createToken = async ()=>{
//     jwt.sign({_id },"")
// }
// createToken();

app.listen(PORT,()=>{
    console.log(`Server is running at port number ${PORT}`)
})



