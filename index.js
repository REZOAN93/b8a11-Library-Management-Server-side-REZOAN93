const express = require("express");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken')

// middleware
app.use(
  cors({
    origin: ["https://assingment11-ed720.web.app"],
    // origin: ["http://localhost:5173"],
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

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "forbidden" });
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRETS, (err, decoded) => {
    if (err) {
      // console.log(err);
      return res.status(401).send({ message: "Unauthorized" });
    }
    // if token is valid then it would be decoded
    // console.log("value in the token ", decoded);
    req.loggedUserData = decoded;
    next();
  });
};


async function run() {
  try {
    // await client.connect();

    const database = client.db("Assingment11");
    const BookCategoryList= database.collection("BookCategoryList");
    const BookCollection = database.collection("BookCollection");
    const userCollection = database.collection("UserCollection");
    const sliderCollection= database.collection("sliderCollection");
    const AboutCollection= database.collection("AboutCollection");
    const CommentsCollection= database.collection("CommentsCollection");
    const BorrowedBookCollection= database.collection("BorrowedBookCollection");

    // user Jwt related API
    app.post("/jwt", async(req, res) => {
      const data = req.body;
      // console.log(data,"Email for the JWT setup")
      const tokenDB = jwt.sign(data,process.env.ACCESS_TOKEN_SECRETS, {
        expiresIn: "1hr",
      });
      res
      .cookie('token', tokenDB, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
        .send({ success: true });
    });


    app.post('/logoutUser',async(req,res)=>{
      const user=req.body;
      res.clearCookie('token').send({success:true})
      // res.clearCookie('token',{maxAge:0}).send({success:true})
    })

    // book related Api
    app.get("/bookCategory", async (req, res) => {
      const cursor = BookCategoryList.find();
      const BookCategory = await cursor.toArray();
      res.send(BookCategory);
    });

    app.get("/allBooks",verifyToken, async (req, res) => {
      if (req.query?.email !== req.loggedUserData?.email) {
        return res.status(403).send("Forbidden access");
      } 
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = BookCollection.find();
      const allBooks = await cursor.toArray();
      res.send(allBooks);
    });

    app.get("/comments", async (req, res) => {
      const cursor = CommentsCollection.find();
      const commentCollection = await cursor.toArray();
      res.send(commentCollection);
    });

    app.get("/about", async (req, res) => {
      const cursor = AboutCollection.find();
      const aboutImage = await cursor.toArray();
      res.send(aboutImage);
    });

    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { category: id };
      const cursor = BookCollection.find(query);
      const BookByCategory = await cursor.toArray();
      res.send(BookByCategory);
    });


    app.get("/userBorrowedBooks",verifyToken, async (req, res) => {
      if (req.query?.email !== req.loggedUserData?.email) {
        return res.status(403).send("Forbidden access");
      }
      console.log(req.query.email)
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = BorrowedBookCollection.find(query);
      const userBookDetails = await cursor.toArray();
      res.send(userBookDetails);
    });


    app.get("/bookdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const detailsBook = await BookCollection.findOne(query);
      res.send(detailsBook);
    });


    app.post("/addbook",verifyToken, async (req, res) => {
      if (req.query?.email !== req.loggedUserData?.email) {
        return res.status(403).send("Forbidden access");
      }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const newBook = req.body;
      const result = await BookCollection.insertOne(newBook);
      res.send(result);
    });

    app.post("/addBorrowedBook/:id",verifyToken, async (req, res) => {
      const readyToBookId = req.params.id;
      const newBook=req.body
      const { email } = req.body;
      console.log(readyToBookId,newBook,"Book Id for the new Borrow")
      const existingBook = await BorrowedBookCollection.findOne({ email, bookId: readyToBookId });
      if (existingBook) {
        return res.status(400).json({ error: "Duplicate entry. Book with the same email and bookId already exists." });
      }
      const result = await BorrowedBookCollection.insertOne(newBook);
      res.send(result);
    });
    
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedqty = req.body;
      // console.log(id, updatedqty.qty);
      // const filter = { _id: new ObjectId(id) };
      // // const options = { upsert: true };
      const updateDoc = await BookCollection.findOneAndUpdate(
        { _id: new ObjectId(id)},
        { $inc: { qty: -1 } },
        { returnOriginal: false },
      )
      res.send({success:true});
    });

    app.put("/returnBorrowed/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id,"Return for borrowed")
      const updateDoc = await BookCollection.findOneAndUpdate(
        { _id: new ObjectId(id)},
        { $inc: { qty: +1 } },
        { returnOriginal: false },
      )
      res.send({success:true});
    });

    app.delete("/deleteBorrowed/:id", async (req, res) => {
      const newId = req.params.id;
      // console.log(newId);
      const query = { _id: new ObjectId(newId) };
      const result = await BorrowedBookCollection.deleteOne(query);
      res.send(result);
      // console.log(result);
    });

    app.put("/updateBook/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBook = req.body;
      // console.log(id, updatedBook);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        // name, price, category, author, description, photoURL, rating, qty, details, bookLink
        $set: {
          category: updatedBook.category,
          name: updatedBook.name,
          author: updatedBook.author,
          price: updatedBook.price,
          description: updatedBook.description,
          photoURL: updatedBook.photoURL,
          rating: updatedBook.rating,
          qty: updatedBook.qty,
          details: updatedBook.details,
          bookLink: updatedBook.bookLink,
        },
      };
      const result = await BookCollection.updateOne(filter,updateDoc,options);
      res.send(result);
    });


    // Slider Collection
    app.get('/slider',async(req,res)=>{
      const cursor = sliderCollection.find();
      const allUsers = await cursor.toArray();
      res.send(allUsers);
    })

    // User Related APIS

    app.post('/isAdmin',async(req,res)=>{
      const loggedemail=req.body.email;
      const userData = await userCollection.findOne({ email:loggedemail });
      console.log(userData,'userData',userData&&userData.role &&userData.role=='librarian')
      if(userData&&userData.role &&userData.role=='librarian'){
        res.send(true)
      }else{
        res.send(false)
      }
    })



    app.post("/user", async (req, res) => {
      const newUser = req.body;
      const result = userCollection.insertOne(newUser);
      res.send(result);
      // console.log(newUser);
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
