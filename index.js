const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");


const port = process.env.PORT ||5000;
const ObjectId = require("mongodb").ObjectId;

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
    const buyingdetailsCollection = database.collection("buyingdetails");
    const userInfoCollection = database.collection("userInfo");
    //get limit products
    app.get("/products", async (req, res) => {
      const result = await watchCollection.find({}).limit(6).toArray();
      res.send(result);
    });
    //get all
    app.get("/allProducts", async (req, res) => {
      const result = await watchCollection.find({}).toArray();
      res.send(result);
    });
    app.delete("/deleteProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await watchCollection.deleteOne(query);
      res.json(result);
    });
    app.post("/addProduct", async (req, res) => {
      const result = await watchCollection.insertOne(req.body);
      res.json(result)
    });
    //get product by id
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await watchCollection.findOne(filter);
      res.send(result);
    });

    app.post("/buyingdetails", async (req, res) => {
      const result = await buyingdetailsCollection.insertOne(req.body);
      res.json(result);
    });
    app.get("/buyingdetails/:email", async (req, res) => {
      const user = req.params.email
      const query = { email: user }
      const result = await buyingdetailsCollection.find(query).toArray();
      res.send(result)
    });
    app.get("/buyingAlldetails/", async (req, res) => {
      const result = await buyingdetailsCollection.find({}).toArray();
      res.send(result)
    });
    app.delete("/buyingdetails/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id:ObjectId(id) }
      const result = await buyingdetailsCollection.deleteOne(query)
      res.json(result)
    });

    //update statuses
    app.put("/buyingdetails/:id", async (req, res) => {
      const user = req.body;
      const id=req.params.id
      const filter = {
        _id: ObjectId(id)
      };
       const updateDoc = {
         $set: { status: user.status },
       };
const result = await buyingdetailsCollection.updateOne(
  filter,
  updateDoc,
      );
      res.json(result)
    });

    //userInfo
    app.post("/userInfo", async (req, res) => {
      const result = await userInfoCollection.insertOne(req.body);
      res.json(result);
    });
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
