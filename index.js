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


/* TODO:verify jwt token */ 
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}


async function run() {
  try {
    await client.connect();
    const partsCollection = client.db("ferrarilux").collection("parts");
    const bookingCollection = client.db("ferrarilux").collection("orders");
    const userCollection = client.db("ferrarilux").collection("users" );
    const reviewCollection = client.db("ferrarilux").collection("reviews" );

  // todo:orders part
  app.post('/review', async (req,res)=>{
    const review =req.body;
    console.log(order);
    const result = await reviewCollection.insertOne(review);
    res.send(result)
  })

    // TODO:get all users
    app.get('/user',verifyJWT, async (req,res)=>{
      const users = await userCollection.find().toArray();
      res.send(users);
    })


    // TODO: secure admin role
    app.get('/admin/:email', async(req, res) =>{
      const email = req.params.email;
      // console.log(email);
      const user = await userCollection.findOne({email: email});
      const isAdmin = user.role === 'admin';
      res.send({admin: isAdmin})
    })


    // TODO:verify admin role
    app.put('/user/admin/:email',verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email: requester });
      if(requesterAccount.role==='admin'){

        const filter = { email: email };
        const updateDoc = {
          $set: {role:'admin'},
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
      else{
        res.status(403.).send({message:'forbidden'})
      } 
    })


    // TODO:create user
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      // console.log(user);
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
       const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({result,token});
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

    


      // todo:orders part
      app.post('/orders', async (req,res)=>{
        const order =req.body;
        console.log(order);
        const result = await bookingCollection.insertOne(order);
        res.send(result)
      })



      // TODO:get my orders
      app.get('/orders',verifyJWT, async(req,res)=>{
        const userEmail = req.query.userEmail;
        const decodedEmail=req.decoded.email;
        if( userEmail===decodedEmail){
          const query = {userEmail:userEmail}
          const bookings = await bookingCollection.find(query).toArray();
          res.send(bookings)
        }
        else{
          return res.status(403).send({message:'forbidden access'})
        } 
  
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
