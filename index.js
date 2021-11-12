const express = require("express");
const app = express();
let cors = require("cors");

require("dotenv").config();
const { MongoClient } = require("mongodb");
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_ID_TOKEN);

const port = process.env.PORT ||5000;
const ObjectId = require("mongodb").ObjectId;

//middleware 
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); 
app.use(express.json())

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// database connect 

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zpne0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const verifyToken = async (req, res, next) => {
  if (req.headers.authorization) {
    const idToken = req.headers.authorization.split(" ")[1];
    try {
      const decodedUser = await admin.auth().verifyIdToken(idToken);
      req.decodedEmail = decodedUser.email
      
    }
    catch { }
  }
  next();
}



async function run() {
  try {
    await client.connect();
    //collection
    const database = client.db("WatchBox");
    const watchCollection = database.collection("All_Watch");
    const buyingdetailsCollection = database.collection("buyingdetails");
    const userInfoCollection = database.collection("userInfo");
    const reviewCollection = database.collection("review")
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
    // delete   
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
    //post review
    app.post('/review', async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.json(result);
    })
    //get review
    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    })
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


///make admin 
    
    app.put("/adminEmail",verifyToken, async (req, res) => {
      const user = req.body;
      const requesterEmail = req.decodedEmail;
      if (requesterEmail) {
        const requester = await userInfoCollection.findOne({
          email: requesterEmail,
        });
        if (requester.role === "admin") {
          const filter = { email: user.email };
          const updateDoc = {
            $set: { role: "admin" },
          };
          const result = await userInfoCollection.updateOne(filter, updateDoc);
          res.json(result);
        }
      } else {
        res.status(403).json({message: "You do not have permission to make an admin"})
      }
     
    });
//check admin 
    app.get("/userData/:email", async (req, res) => {
      const user = req.params.email;
      const query = { email: user }
      const result = await userInfoCollection.findOne(query);
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
      }
      res.send(isAdmin);
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
