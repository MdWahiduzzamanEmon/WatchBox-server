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
console.log("Connected database", uri);
app.get("/", (req, res) => {
  res.send("Hello Watch World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
