const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT | 5000;

//middleware
app.use(cors())
app.use(express.json())

//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l4izjw0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const database = client.db('summerCamp');
    const usersCollection = database.collection('users');
    const classesCollection = database.collection('classes');


    // classes

    //create class
    app.post('/classes', async (req, res) => {
      const newClass = req.body;
      // console.log(req.body);
      const result = await classesCollection.insertOne(newClass);
      res.send(result)

    })

    // classes
    app.get('/classes', async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result)
    })


    // approved classes
    app.get('/classes/approved', async (req, res) => {
      const query = { status: 'approved' };
      const result = await classesCollection.find(query).toArray();
      res.send(result)
    })

    //popular classes 
    app.get('/classes/popular', async(req, res) => {
      const result = await classesCollection.find().sort({admittedStudents:1}).limit(6).toArray();
      res.send(result)
    })


    // get classes of instructor
    app.post('/classes/instructor', async(req, res) =>{
      const email = req.body.email;
      const query = {instructorEmail: email};
      const result = await classesCollection.find(query).toArray();
      res.send(result)
    })

    // update selected classes
    app.put('/classes/:id', async(req, res) => {
      const selectedClasses = req.body.remainingIds;
      // console.log(selectedClasses);
      const filter = { _id: new ObjectId(req.params.id)};
      const updateDoc = {
        $set: {
          selectedClasses: selectedClasses
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result);
    })

    // get selected classes 
    app.get('/classes/:id', async(req, res) => {
      const query = { _id: new ObjectId(req.params.id)};
      const user = await usersCollection.findOne(query);
      const classes = user.selectedClasses;
      const oids = [];
      classes.forEach(function(item){
      oids.push(new ObjectId(item));
      });
      const result = await classesCollection.find({ _id: {$in : oids}}).toArray();
      res.send(result)
    })

    // select class and store id to user id
    app.put('/class/:id/:classId', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) }
      const selectedClass = req.params.classId;
      const user = await usersCollection.findOne(query);
      const selectedClasses = user.selectedClasses
      selectedClasses.push(selectedClass)
      const updateUser = {
        $set: {
          selectedClasses: selectedClasses
        }
      }
      const result = await usersCollection.updateOne(query, updateUser)
      res.send(result)
    })

    // update status 
    app.patch('/classes/update', async (req, res) => {
      const id = req.body.id;
      const filter = { _id: new ObjectId(id) }
      const status = {
        $set: {
          status: req.body.status
        }
      }
      const result = await classesCollection.updateOne(filter, status)
      res.send(result)
    })


    //user

    //create user
    app.post('/user', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const consisting = await usersCollection.findOne(query);
      if (consisting) {
        return res.send({ message: "User Exist" })
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    //get all users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    })

    // get instructors
    app.get('/users/instructor', async (req, res) => {
      const query = {role: 'Instructor'}
      const result = await usersCollection.find(query).toArray();
      res.send(result)
    })

    // popular instructors
    app.get('/instructors/popular', async(req, res) => {
      const query = {role: "Instructor"}
      const result = await usersCollection.find(query).sort({
        numberOfStudents:1}).limit(6).toArray();
      res.send(result)
    })

    // delete user 
    app.delete('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result)
    })

    // update user role 
    app.put('/user', async (req, res) => {
      const id = req.body.id;
      const role = {
        $set: {
          role: req.body.role
        }
      }
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(filter, role, options);

      res.send(result)
    })

    //get user info
    app.get('/user/:uid', async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await usersCollection.findOne(query);
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Summer School running')
})

app.listen(port, () => {
  console.log("Summer Camp is running on Port: ", port);
})