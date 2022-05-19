const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ebnmt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden" });
    }
    req.decoded = decoded;
    console.log(decoded);
    next();
  });
};

const run = async () => {
  try {
    await client.connect();
    const taskCollection = await client.db("todo-app").collection("task");
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const options = { upsert: true };
      const filter = { email: email };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ result, token });
    });

    app.post("/task", async (req, res) => {
      const task = req.body;
      console.log(task);
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    app.delete("/task/:id", async (req, res) => {
      const doctorId = req.params.id;
      const doctor = { _id: ObjectId(doctorId) };
      const result = await taskCollection.deleteOne(doctor);
      res.send(result);
    });

    app.get("/task", async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });
  } finally {
    // await client.console()
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello todo app uncle!");
});

app.listen(port, () => {
  console.log(`todo app listening on port ${port}`);
});
