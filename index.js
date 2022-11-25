const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.biy4zxs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
     try{
          const categoryCollections = client.db('sellDomDB').collection('categories');

          app.get('/categories',async(req, res)=>{
               const query = {}
               const categories = await categoryCollections.find(query).toArray()
               res.send(categories);
          })

          app.get('/categories/:id',async(req, res)=>{
               const id = req.params.id;
               const query = {_id: ObjectId(id)}
               const category = await categoryCollections.findOne(query)
               res.send(category)
          })

     }
     finally{

     }

}
run().catch(err=> console.error(err))


app.get('/', async (req, res) => {
     res.send('sellDom server in running')
})


app.listen(port, () => {
     console.log(`port is running at port ${port}`)
})