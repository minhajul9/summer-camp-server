const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    await client.connect();

    const database = client.db('summerCamp');
    const usersCollection = database.collection('users')

    //user

    //create user
    app.post('/user', async(req, res) => {
        const user = req.body;
        const query = {email: user.email}
        const consisting = await usersCollection.findOne(query);
        if(consisting){
            return res.send({message: "User Exist"})
        }
        const result = await usersCollection.insertOne(user)
        res.send(result)
    })

    //get user info
    app.get('/user/:email', async(req, res) =>{
        const email = req.params.email;
        console.log(email);
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