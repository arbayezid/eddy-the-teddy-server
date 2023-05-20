const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ippmfv5.mongodb.net/?retryWrites=true&w=majority`;

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

    const toyCollection = client.db('toyDB').collection('toy')


    // Create Indexing for search
    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "toyName" }

    const result = await toyCollection.createIndex(indexKeys, indexOptions)


    app.get('/getToyByName/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection.find({
        $or: [
          { toyName: { $regex: searchText, $options: 'i' } }
        ]
      }).toArray()
      res.send(result)
    })

    app.get('/all-toys', async (req, res) => {
      const result = await toyCollection.find().toArray()
      res.send(result)
    })


    app.get('/all-toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query)
      res.send(result)
    })


    app.get('/category-toys/:text', async(req,res) =>{
      const subCategory = req.params.text;
      const result = await toyCollection.find({subCategory: subCategory}).toArray()
      res.send(result)
    })

    app.get('/my-toys/:email', async (req, res) => {
      const email = req.params.email
      const result = await toyCollection.find({ email: email }).toArray()
      res.send(result)
    })

    app.post('/add-toy', async (req, res) => {
      const body = req.body;
      const result = await toyCollection.insertOne(body)
      res.send(result)
    })

    app.put('/my-toys/:id', async (req, res) => {
      const id = req.params.id;
      const body = req.body
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          price: body.price,
          availableQuantity: body.availableQuantity,
          description: body.description
        }
      }
      const result = await toyCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })

    app.delete('/my-toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
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
  res.send('Toy Server Is Running')
})

app.listen(port, () => {
  console.log(`Toy server is running on port: ${port}`)
})