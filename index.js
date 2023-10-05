const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dkcfdg8.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const UsersCollection = client.db('toySports').collection('users')
    const categoryCollection = client.db('toySports').collection('category');
    const addToyCollection = client.db('toySports').collection('toys')
    

 
// user api 
  app.get('/users', async(req, res) =>{
    const result = await UsersCollection.find().toArray();
    res.send(result);
  })

  app.post('/users', async(req, res) => {
    const user = req.body;
    const query = {email: user.email}
    const existingUser = await UsersCollection.findOne(query)
    if(existingUser){
      return res.send({message : 'user already exist'})
    }
    const result = await UsersCollection.insertOne(user);
    res.send(result);
  })

  // admin roll check
  app.get('/users/admin/:email', async(req, res) => {
    const email = req.params.email;
    const query = {email : email}
    const user = await UsersCollection.findOne(query);
    const result = {admin : user ?.role === 'admin'}
    res.send(result);
  })

  // user role update 
  app.patch('/users/admin/:id', async(req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id)};

    const updateDoc = {
      $set: {
        role: 'admin'
      },
    };

    const result = await UsersCollection.updateOne(filter, updateDoc);
    res.send(result)

  })

  // users delete 
  app.delete('/users/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await UsersCollection.deleteOne(query);
    res.send(result)
  })



// category api 
  app.get('/category/:status', async(req, res) => {
         const { status } = req.params;

        if(status == "dc" || status == "marvel" || status == "avengers"){
          const result = await categoryCollection.find({role : req.params.status}).toArray();
          return res.send(result)
          
        }
    })



    app.get('/category', async(req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result)
  })

  // all toy api 

  // app.get('/toys', async(req, res) => {
  //   const result = await addToyCollection.find().toArray();
  //   res.send(result);
  // })

  // add toys api
  app.get('/toys', async(req, res) => {
    let query = {};
    if(req.query?.email){
      query = {email: req.query.email}
    }
    const cursor = addToyCollection.find(query);
    const result = await cursor.toArray();
    res.send(result)
  })

  
  app.get('/toys', async(req, res) => {
    const cursor = addToyCollection.find(query);
    const result = await cursor.toArray();
    res.send(result)
  })

  app.get('/toys/:id', async(req, res) => {
    const id = req.params.id
   const query = {_id : new ObjectId(id)}
   const result = await addToyCollection.findOne(query);
   res.send(result)
  })


// new toy add api 
app.post('/toys', async(req, res) => {
  const toy = req.body;
  const result = await addToyCollection.insertOne(toy);
  res.send(result)
})


// appoved toy 
app.patch('/toys/approved/:id', async(req, res) => {
  const id = req.params.id;

  const query = {_id: new ObjectId(id)}
  const updateDoc = {
    $set: {
      status: 'approved',
    },
  };
  const result = await addToyCollection.updateOne(query, updateDoc);
  res.send(result);
})


// denied toy 
app.patch('/toys/denied/:id', async(req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const updateDocument = {
    $set: {
       status: 'denied',
    },
 };
 const result = await addToyCollection.updateOne(query, updateDocument);
 res.send(result);
})


  app.put('/toys/:id' , async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const options = {upsert: true};
    const updateToy = req.body;
    const toy = {
      $set: {
        picture: updateToy.picture,
        toyname: updateToy.toyname,
        sellerName: updateToy.sellerName,
        email: updateToy.email,
        category: updateToy.category,
        rating: updateToy.rating,
        price : updateToy.price,
        quantity :updateToy.quantity,
        description :updateToy.description
      },
    };

    const result = await addToyCollection.updateOne(query, toy , options);
    res.send(result)



  })

  app.delete('/toys/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await addToyCollection.deleteOne(query);
    res.send(result)
  })


  // toys filter
  app.get('/toys/:status', async(req, res) => {
    const { status } = req.params;

   if(status == "pending" || status == "approved" || status == "denied"){
     const result = await addToyCollection.find({role : req.params.status}).toArray();
     return res.send(result)
     
   }
})





  


 
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/' , (req, res) => {
    res.send('toys is running')
})
app.listen(port, () => {
    console.log(`toy-sports-car-server is running on port ${port}`)
})

const corsOptions ={
  origin:'*',
  credentials:true,
  optionSuccessStatus:200,
}
app.use(cors(corsOptions))