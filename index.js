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
        const result = await bookingCollection.insertOne(order);
        res.send(result)
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
