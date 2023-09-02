
require('./config/db');

const express = require("express");
const authRoute = require('./routes/auth');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use("/api/auth", authRoute);

const coinbase = require("coinbase-commerce-node");
const Client = coinbase.Client;
const resources = coinbase.resources;

Client.init(process.env.COINBASE_API_KEY);

app.post("/checkout", async(req,res) => {
    const {amount, currency} = req.body;

    try{
        const charge = await resources.Charge.create({
            
            name: "crypto-360",
            description: "Deposit",
            local_price:{
                amount: amount,
                currency:currency,
            },
            pricing_type:"fixed_price",
            metadata:{
                user_id:"3434"
            },
        });
        // res.status(200).json({
        //     charge:charge.hosted_url,
        // })

        res.redirect(charge.hosted_url)

    }catch(error){
        res.status(500).json({
            error:error,
        })
    }
})

//payments ends here

app.post("/webhook", async (req,res) => {
  try {
    const event = Webhook.verifyEventBody(
        req.rawBody,
        req.headers["x-cc-webhook-signature"],
        process.env.COINBASE_API_KEY
    );

    if(event.type === "charge:confirmed"){
        let amount = event.data.pricing.local.amount;
        let currency = event.data.pricing.local.currency;
        let user_id = event.data.metadata.user_id;

        console.log(amount, currency, user_id)
    }

    res.sendStatus(200)
  } catch (error) {
    res.status(500).json({
        error:error,
    })
  }
})

// const users = []; // In-memory storage for simplicity


app.listen(PORT, () => {
    console.log(`Server runnng on Port ${PORT}.......`)
})