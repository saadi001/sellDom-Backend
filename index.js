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
          const productsCollections = client.db('sellDomDB').collection('products');
          const usersCollections = client.db('sellDomDB').collection('users');

          // getting categories          
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

          app.get('/products', async(req, res)=>{
               let query = {}
               if(req.query.category){
                    query={
                         category: req.query.category
                    }
               }
               const categoryProduct = await productsCollections.find(query).toArray()
               res.send(categoryProduct)
          })

          app.post('/users', async(req, res)=>{
               const query = req.body;
               const result = await usersCollections.insertOne(query)
               res.send(result);
          })

          app.get('/users', async(req, res)=>{
               const query = {}
               const users = await usersCollections.find(query).toArray()
               res.send(users)
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