const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");


const port = process.env.PORT ||5000;


//middleware 
app.use(cors())
app.use(express.json())


// database connect 

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zpne0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


async function run() {
  try {
    await client.connect();
    const database = client.db("WatchBox");
    const watchCollection = database.collection("All_Watch");
    
    //get limit products
    app.get("/products", async (req, res) => {
      const result = await watchCollection.find({}).limit(6).toArray();
      res.send(result)
    })
    //get all
    app.get("/allProducts", async (req, res) => {
      const result = await watchCollection.find({}).toArray();
      res.send(result)
    })



  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
































app.get("/", (req, res) => {
  res.send("Hello Watch World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
