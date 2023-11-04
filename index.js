const express = require("express");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
require("dotenv").config();
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.SECRET_KEY}@cluster0.lh0lzsv.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const database = client.db("Assingment11");
    const userCollection = database.collection("UserCollection");

   
    app.post("/user", async (req, res) => {
      const newUser = req.body;
      const result = userCollection.insertOne(newUser);
      res.send(result);
      console.log(newUser);
    });

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const allUsers = await cursor.toArray();
      res.send(allUsers);
    });

    app.delete("/users/:id", async (req, res) => {
      const newId = req.params.id;
      const query = { _id: new ObjectId(newId) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/users", async (req, res) => {
      const data = req.body;
      const email = data.emailInfo;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          LastLogInTime: data.userLastSign,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port);
