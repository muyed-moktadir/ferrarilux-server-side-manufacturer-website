const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 5000;

// MiddleTire
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello from ferrarilux Portal");
  });
  
  app.listen(port, () => {
    console.log(`listening on ferrarilux Portal port: ${port}`);
  });