//jshint esversion:6
require ('dotenv').config()
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose = require('mongoose');
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

// const bcrypt=require("bcrypt");
// const saltRounds=10;
// const encrypt= require ("mongoose-encryption");
// const md5=require("md5");
const app=express();

// console.log(process.env.API_KEY);
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


main().catch(err=> console.log(err));
async function main(){
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
}

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ["password"]});

const User= new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
    res.render("home");
});
app.get("/login", function(req,res){
    res.render("login");
});

app.get("/register", function(req,res){
    res.render("register");
});

app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res) {
    req.logout(function(err) {
        if (err) {
            // Handle any errors that occur during logout
            console.error(err);
            return res.redirect("/"); // Redirect to home page, or handle as appropriate
        }
        res.redirect("/"); // Successful logout, redirect to home page
    });
});

// app.post("/register", function(req,res){
//     const newUser= new User({
//         email:req.body.username,
//         password: md5(req.body.password)
//     });
//     newUser.save()
//     .then(() => {
//         res.render("secrets");
//     })
//     .catch((err) => {
//         console.log(err);
//     });
// });

// app.post("/register", function(req,res){
//     bcrypt.hash(req.body.password, saltRounds, function(err, hash){
//         const newUser= new User({
//             email:req.body.username,
//             password: hash
//         });
//         newUser.save()
//         .then(() => {
//             res.render("secrets");
//         })
//         .catch((err) => {
//             console.log(err);
//         });
//     });
// });

// app.post("/login", function(req,res){
//     const username= req.body.username;
//     const password=md5(req.body.password);
//     User.findOne({ email: username })
//     .then((foundUser) => {
//         if (foundUser && foundUser.password === password) {
//             res.render("secrets");
//         } else {
//             // Handle case where user is not found or password does not match
//             // You might want to redirect or render an error page here
//         }
//     })
//     .catch((err) => {
//         console.log(err);
//     });
// });

app.post("/register", function(req,res){

    User.register({username:req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    });
});

// app.post("/login", function(req,res){
//     const username= req.body.username;
//     const password=req.body.password;
//     User.findOne({ email: username })
//     .then((foundUser) => {
//         bcrypt.compare(password , foundUser.password, function(err, result){
//             if (result === true) {
//                 // Assuming you're using Express and have set up a rendering engine
//                 res.render("secrets");  
//             } else {
//                 console.error("Incorrect Password");
//             }
//         });
//     })
//     .catch((err) => {
//         console.log(err);
//     });
// });

app.post("/login", function(req,res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(3000, function(){
    console.log("Server started on port 3000.");
});
