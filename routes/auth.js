const router = require("express").Router();
const User = require("../modals/User");
const bcrypt = require("bcrypt"); 
require("dotenv").config()
const crypto = require("crypto");

// Signup route
router.post("/signup", async (req, res) => {
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt)
        let newUser = new User({ 
            firstName:req.body.firstname,
            lastName: req.body.lastName,
            userName:req.body.userName,
            country:req.body.country,
            currency:req.body.currency,
            email: req.body.email,
            password: hashedPass,
            role:req.body.role,
            emailToken: crypto.randomBytes(64).toString('hex'),
            isVerified: false,
            
        })
        // 
        const users = await newUser.save();
         // Check if the response status is 200 (or any other successful status code)
    //     if (res.status === 200) {
    //     // Redirect the user to a certain page upon successful signup
    //     res.redirect('http://localhost:5500/login/index.htm');
    //   } else {
    //     // Handle unsuccessful signup (e.g., display an error message)
    //     res.status(response.status).send('Signup failed');
    //   }
    res.redirect('https://crypto-360.netlify.app/login/index.htm');
       //res.status(200).json({ message: 'Signup successful' })
        //console.log(users)
    }
       catch(error){
          res.status(400).json(error);
       }
})
// app.post('/signup', (req, res) => {
//   const { fname,lname,email,username, password, country } = req.body;

//   // Check if user already exists
//   const existingUser = users.find(user => user.username === username);
//   if (existingUser) {
//     return res.status(400).json({ message: 'User already exists' });
//   }

//   // Create a new user and store in memory
//   users.push({ fname,lname,email,username, password,country });
//   res.status(201).json({ message: 'Signup successful' });
// });

// Login route
// router.post('/login', (req, res) => {
//   const { username, password } = req.body;

//   // Find the user in the users array
//   const user = users.find(user => user.username === username && user.password === password);
//   if (!user) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }

//   res.json({ message: 'Logged successful' });
  
// });

router.post("/login",  async (req, res) => {
    try{
     
     const user = await User.findOne({userName: req.body.userName});
     !user && res.status(400).json("wrong information")

     const validated = await bcrypt.compare(req.body.password, user.password);
     !validated && res.status(400).json("wrong information")

    const { password, email, userName, role, ...others } = user._doc;
     
 //    user.id = req.sessionID
 //    req.suirhkession.isAuth = true
 //    req.session.user =user
 // const token = await jwt.sign({_id: user._id}, process.env.ACCESS_TOKEN_SECRET)
 // res.status(200).json({token:token,
 // _id: user._id
 //res.status(200).json("sucessfully logged")
 res.redirect('https://crypto-360.netlify.app/mining/index.html');
       // Check if the response status is 200 (or any other successful status code)
    //     if (res.status == 200) {
    //     // Redirect the user to a certain page upon successful signup
    //     //res.redirect('http://localhost:5500/login/index.htm');
    //     // alert("sucessfully logged")
    //     res.status(200).json("sucessfully logged")
    //   }return
 // })
  
    } catch(err){
          res.status(400).json('err')
    }
})

module.exports = router;