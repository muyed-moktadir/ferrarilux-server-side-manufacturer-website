const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const ObjectId = require("mongodb").ObjectId;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

// MiddleTire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7epw5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const partsCollection = client.db("ferrarilux").collection("parts");
    const bookingCollection = client.db("ferrarilux").collection("orders");
    const userCollection = client.db("ferrarilux").collection("users" );


    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      /*email diye dekhbo user ase kina*/
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      //  const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({result, token});
    })


    // TODO:get all part 
      app.get("/part", async (req, res) => {
      const query = {};
      const cursor = partsCollection.find(query);
      const parts = await cursor.toArray();
      res.send(parts);
      });

      // TODO:get single part by id 
      app.get("/part/:id", async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const query = { _id: ObjectId(id) };
        const part = await partsCollection.findOne(query);
        res.send(part);
      });

      app.post('/booking', async (req,res)=>{

        /*post er data thake body er moddhe. booking er data ta er req ashtese client theke */
        const booking = req.body; 
        const query = {treatment: booking.treatment,date:booking.date,patient:booking.patient};
  
        /*then data base  a query diye find korbe (74.3)*/ 
        const exists = await bookingCollection.findOne(query);
        if(exists){
          return res.send({success:false,booking:exists})
        }
  
        const result = await bookingCollection.insertOne(booking);
        return res.send({success:true, result});
      })


      // todo:orders part
      app.post('/orders', async (req,res)=>{
        const order =req.body;
        const result = await bookingCollection.insertOne(order);
        res.send(result)
      })




      // TODO:get my orders
      app.get('/orders',async(req,res)=>{
        const userEmail = req.query.userEmail;
        console.log(userEmail);
        const query = {userEmail:userEmail}
        const bookings = await bookingCollection.find(query).toArray();
        res.send(bookings)
  
      })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Hello from ferrarilux Portal");
});

app.listen(port, () => {
  console.log(`listening on ferrarilux Portal port: ${port}`);
});
