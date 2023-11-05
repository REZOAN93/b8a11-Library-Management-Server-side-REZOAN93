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
    // const BrandNames = database.collection("BrandNames");
    // const ProductCollection = database.collection("ProductCollection");
    // const UserProductCollection = database.collection("UserProductCollection");
    const userCollection = database.collection("UserCollection");
    const sliderCollection= database.collection("sliderCollection");

    // app.post("/jwt", (req, res) => {
    //   const data = req.body;
    //   const tokenDB = jwt.sign(data, process.env.ACCESS_TOKEN_SECRETS, {
    //     expiresIn: "1hr",
    //   });
    //   res
    //     .cookie("token", tokenDB, {
    //       httpOnly: true,
    //       secure: false,
    //     })
    //     .send({ success: true });
    // });

    // app.get("/brands", async (req, res) => {
    //   const cursor = BrandNames.find();
    //   const brandsDetails = await cursor.toArray();
    //   res.send(brandsDetails);
    // });

    // app.get("/brands/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { brand: id };
    //   const cursor = ProductCollection.find(query);
    //   const brandProducts = await cursor.toArray();
    //   res.send(brandProducts);
    // });

    // app.get("/productdetails/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const detailsProduct = await ProductCollection.findOne(query);
    //   res.send(detailsProduct);
    // });

    // app.post("/addProducts", async (req, res) => {
    //   const newProducts = req.body;
    //   const result = await ProductCollection.insertOne(newProducts);
    //   res.send(result);
    // });

    // app.post("/userProducts", async (req, res) => {
    //   const userProduct = req.body;
    //   const result = UserProductCollection.insertOne(userProduct);
    //   res.send(result);
    //   console.log(result);
    // });

    // app.get("/userProducts", async (req, res) => {
    //   const cursor = UserProductCollection.find();
    //   const userProductDetails = await cursor.toArray();
    //   res.send(userProductDetails);
    // });

    // app.delete("/UserProductsData/:id", async (req, res) => {
    //   const newId = req.params.id;
    //   console.log(newId);
    //   const query = { _id: new ObjectId(newId) };
    //   const result = await UserProductCollection.deleteOne(query);
    //   res.send(result);
    //   console.log(result);
    // });

    // app.put("/update/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const updatedProducts = req.body;
    //   console.log(id, updatedProducts);
    //   const filter = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     // brand,name,type,price,description,photoURL,cover,rating
    //     $set: {
    //       brand: updatedProducts.brand,
    //       name: updatedProducts.name,
    //       type: updatedProducts.type,
    //       price: updatedProducts.price,
    //       description: updatedProducts.description,
    //       photoURL: updatedProducts.photoURL,
    //       cover: updatedProducts.cover,
    //       rating: updatedProducts.rating,
    //     },
    //   };
    //   const result = await ProductCollection.updateOne(
    //     filter,
    //     updateDoc,
    //     options
    //   );
    //   res.send(result);
    // });

    // Slider Collection

    app.get('/slider',async(req,res)=>{
      const cursor = sliderCollection.find();
      const allUsers = await cursor.toArray();
      res.send(allUsers);
    })

    // User Related APIS
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

// app.get("/", function (req, res, next) {
//   res.json({ msg: "This is CORS-enabled for all origins!" });
// });

app.listen(port);
