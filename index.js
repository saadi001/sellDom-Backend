const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.biy4zxs.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
     const authHeader = req.headers.authorization;
     if(!authHeader){
          return res.status(401).send('unathorized access!')
     }
     const token = authHeader.split(' ')[1];
     jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
          if(err){
               return res.status(403).send({message: 'forbidden access'})
          }
          req.decoded = decoded;
          next();
     })
}

async function run(){
     try{
          const categoryCollections = client.db('sellDomDB').collection('categories');
          const productsCollections = client.db('sellDomDB').collection('products');
          const usersCollections = client.db('sellDomDB').collection('users');
          const bookingsCollections = client.db('sellDomDB').collection('bookings');

          // categories          
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

          // products 
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

          app.get('/myProducts', async(req, res)=>{
              let query = {}
              if(req.query.sellers_name){
               query= {
                    sellers_name: req.query.sellers_name
               }
              }
              const myProduct = await productsCollections.find(query).toArray()
              res.send(myProduct)
              
          })

          app.post('/products',async(req, res)=>{
               const query = req.body;
               const result = await productsCollections.insertOne(query)
               res.send(result)
          })

          app.delete('/myProducts/:id', async(req, res)=>{
               const id = req.params.id;
               const filter = {_id: ObjectId(id)}
               const result = await productsCollections.deleteOne(filter)
               res.send(result)
          })

          // users           

          app.get('/users', async(req, res)=>{
               const query = {}
               const users = await usersCollections.find(query).toArray()
               res.send(users)
          })

          app.get('/users/admin/:email',async(req, res)=>{
               const email = req.params.email;
               const query = {email: email}
                const user = await usersCollections.findOne(query)
               res.send({isAdmin: user?.author === 'admin'})
          })
          

          app.get('/jwt', async(req, res)=>{
               const email = req.query.email;
               const query = {email:email}
               const user = await usersCollections.findOne(query)
               if(user){
                    const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                    return res.send({accessToken: token})
               }
               res.status(403).send({accessToken: ''})
          })

          app.get('/usersByRole',async(req, res)=>{
               let query = {}
               if(req.query.role){
                    query = {
                         role: req.query.role
                    }
               }
               const result = await usersCollections.find(query).toArray()
               res.send(result)
          })

          app.post('/users', async(req, res)=>{
               const query = req.body;
               const result = await usersCollections.insertOne(query)
               res.send(result);
          })

          app.put('/users/admin/:id',verifyJWT, async(req, res)=>{
               const decodedEmail = req.decoded.email;
               const query = {email: decodedEmail}
               const user = await usersCollections.findOne(query);

               if(user?.author !== 'admin'){
                    return res.status(403).send({message: 'forbidden access'})
               }

               const id = req.params.id;
               const filter = {_id: ObjectId(id)}
               const options = {upsert: true}
               const updatedDoc = {
                    $set:{
                         author: 'admin'
                    }
               }
               const result = await usersCollections.updateOne(filter,updatedDoc, options)
               res.send(result)
          })

          app.delete('/seller/:id', async(req, res)=>{
               const id = req.params.id;
               const filter = {_id: ObjectId(id)}
               const result = await usersCollections.deleteOne(filter)
               res.send(result)
          })

          // bookings 
          app.get('/bookings',verifyJWT, async(req, res)=>{
               const email = req.query.email;
               const decodedEmail = req.decoded.email;
               if(email !== decodedEmail){
                    return res.status(403).send({message: 'forbidden access'})
               }
               const query = {email: email}
               const bookings = await bookingsCollections.find(query).toArray()
               res.send(bookings)
          })

          app.post('/bookings', async(req, res)=>{
               const booking = req.body;
               const query = {
                    item : booking.item,
                    email : booking.email
               }
               const alreadyBooked = await bookingsCollections.find(query).toArray()
               if(alreadyBooked.length){
                    const message = `You already booked ${booking.item}`
                    return res.send({acknowledged: false, message})
               }
               const result = await bookingsCollections.insertOne(booking)
               res.send(result)
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