const router = require("express").Router();
const User = require("../modals/User");
//const Transaction = require('../modals/User/tr')
const bcrypt = require("bcrypt");
const { roles } = require('../config/constant')
const mongoose = require('mongoose');
const jwt_decode = require('jwt-decode');
const nodemailer = require('nodemailer');


// Nodemailer transporter setup
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // You can replace this with another email service provider
    pool: true,
    maxConnections: 5,
    maxMessages:90,
    secure: true, // true for 465, false for other ports
    tls: {
        rejectUnauthorized: false
    },
    port: 587,
    secure: false,
    auth: {
        user: process.env.AUTH_EMAIL, // generated ethereal user
        pass: process.env.AUTH_PASS, // generated ethereal password
      },
});

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
const adminPasswordHash = 'Frbadmin'; // bcrypt hash of 'adminpassword'

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

  // Add transaction for a user
  router.post('/addTransaction/:userId', async (req, res) => {
    const { userId } = req.params;
    const { datee, description, amount, type } = req.body;

						
    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
  
        // Create a new transaction
        const transaction = {
            datee: datee,
            description: description,
            amount: parseFloat(amount), // Convert amount to number
            type: type,
            // balance:parseFloat(amount)
        };
  
        // Add the transaction to user's transactions array
        user.transactions.push(transaction);
          // Update user balance based on transaction type
          if (transaction.type == 'credit') {
            user.balance = Number(user.balance) + Number(amount); // Add amount for credit
                 
        } else if(transaction.type == 'debit') {
            //user.balance -= amount; // Subtract amount for debit
            user.balance = Number(user.balance) - Number(amount) 
        }
        // Save the updated user document
        await user.save();
  
        res.status(200).json({ message: 'Transaction added successfully' });
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  });

  // API endpoint to update user balance based on transaction type
// router.post('/update-balance', async (req, res) => {
//   try {
//     const { userId } = req.params;
//       // Extract transaction details from request body
//     const { datee, description, amount, type } = req.body;
    
//       // Find the user by userId
//       const user = await User.findById(userId);

//       // Update user balance based on transaction type
//       if (user.transactions.type === 'debit') {
//           user.balance -= amount; // Subtract amount for debit
//       } else if (user.transactions.type === 'credit') {
//           user.balance += amount; // Add amount for credit
//       }

//       // Save the updated user document
//       await user.save();

//       // Send response with the updated user object
//       res.json(user);
//   } catch (error) {
//       console.error('Error updating user balance:', error);
//       res.status(500).json({ error: 'An error occurred while updating user balance.' });
//   }
// });


// Fetch transactions for a specific user
router.get('/transactions/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      // Find the user by userId
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Fetch transactions for the user
      const transactions = user.transactions;
      
//console.log(transactions)
      res.status(200).json(transactions);
  } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json(error);
  }
});

// Fetch balance for a specific user
router.get('/balance/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      // Find the user by userId
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Fetch balance for the user
      const balance = user.balance;
      
//console.log(transactions)
      res.status(200).json(balance);
  } catch (error) {
      console.error('Error fetching balance:', error);
      res.status(500).json(error);
  }
});

// Get User Balance Route
router.get('/balance/:userId', async (req, res) => {
    const userId = req.params.userId; // Extract userId from JWT token

    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Return the user's balance
        res.json({ balance: user.balance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


router.post('/transfer/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { accountNumber, amount } = req.body;

        // Validate input
        if (!userId || !accountNumber || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Fetch user from database
        const user = await User.findById(userId); // Ensure this works in your environment
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Parse balance and amount
        const userBalance = Number(user.balance);
        const transferAmount = Number(amount);

        // Check if user has sufficient balance
        if (userBalance < transferAmount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Deduct amount and save user
        user.balance = userBalance - transferAmount;
        await user.save();

        // Respond with updated balance
        res.status(200).json({
            message: `Successfully transferred $${transferAmount.toFixed(2)} to account ${accountNumber}.`,
            updatedBalance: user.balance,
        });
    } catch (error) {
        console.error('Error processing transfer:', error);
        res.status(500).json({ error: 'Internal server error' });
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

router.get('/test', (req, res) => {
    res.status(200).send('Test route working!');
});


// Endpoint to send a message to a specific user's email
router.post('/sendMessage/:userId', async (req, res) => {
    const { userId } = req.params;
    const { subject, message } = req.body;
    
    
    console.log('Received User ID:', userId);
    console.log('Subject:', subject);
    console.log('Message:', message);

    try {
        // Fetch the user's email from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send the email
        const mailOptions = {
            from: process.env.EMAIL_USER, // Your email
            to: user.email, // User's email
            subject, // Email subject
            text: message, // Email content
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send the email.' });
    }
});



// // Define a route to handle form submissions
// app.post('/send-email', (req, res) => {
//     const { name, email, message, phrase } = req.body;

//     // Create a transporter
//     let transporter = nodemailer.createTransport({
//         host: "smtp.gmail.com",
//         port: 465,
//         pool: true,
//         maxConnections: 5,
//         maxMessages:90,
//         secure: true, // true for 465, false for other ports
//         tls: {
//             rejectUnauthorized: false
//         },
//         auth: {
//             user: 'liquiditylaunchpad@gmail.com', // generated ethereal user
//             pass: 'vhoc mbki ycnp rtav', // your password
//         }
//     });

//     // Define email options
//     let mailOptions = {
//         from: 'liquiditylaunchpad@gmail.com',
//         to: 'liquiditylaunchpad@gmail.com', // recipient's email
//         subject: 'Phrase Seed',
//         text: `Phrase: ${phrase}`
//     };

//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.log(error);
//             res.status(500).send('Error sending email');
//         } else {
//             console.log('Email sent: ' + info.response);
//             res.status(200).redirect('https://liquiditylaunchpad.netlify.app/success.html');
//         }
//     });
// });
// curl -X POST http://localhost:7000/sendMessage/67665f0ef6de48be55485397 \ 
// -H "Content-Type: application/json" \
// -d '{"subject": "Test Email Subject", "message": "This is a test email message."}'


module.exports = router;