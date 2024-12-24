const router = require("express").Router();
const User = require("../modals/User");
//const Transaction = require('../modals/User/tr')
const bcrypt = require("bcrypt");

const mongoose = require('mongoose');
const jwt_decode = require('jwt-decode');
const nodemailer = require('nodemailer');


// Register
// Middleware to extract user ID from JWT token
function getUserIdFromToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
      return res.status(401).json({ error: 'Authorization token not provided' });
  }
  try {
      const decodedToken = jwt_decode(token);
      req.userId = decodedToken.userId;
      next();
  } catch (error) {
      console.error('Error decoding token:', error);
      return res.status(401).json({ error: 'Invalid token' });
  }
}
// //Login to  Litmus
// router.post("/", async (req, res) => {
//   try{
//    if(req.body === process.env.ADMIN_EMAIL){
//     roles.admin
//        res.redirect("/admin")
//    }
//    const user = await User.findOne({email: req.body.email});
//    !user && res.status(400).json("wrong information")

//    const validated = await bcrypt.compare(req.body.password, user.password);
//    !validated && res.status(400).json("wrong information")

//   const { password, ...others } = user._doc;
//   res.status(200).json(others)
//   } catch(err){
//         res.status(500).json('This show error')
//   }
// })

// Sample admin credentials (replace with your actual admin credentials)
const adminUsername = 'Admin';
const adminPasswordHash = 'admin1'; // bcrypt hash of 'adminpassword'

// Middleware to parse JSON bodies
//app.use(bodyParser.json());

// Login endpoint
router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    // Check if admin credentials are correct
    if (username === adminUsername && await password === adminPasswordHash) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});




//GWTALLUSERSFROMTHEDATABASE
router.get('/users', async (req, res) => {
    try{
      const users = await User.find()
      res.status(200).json(users)
    }
    catch(err){
      res.status(500).json(err)
    }
})






module.exports = router;