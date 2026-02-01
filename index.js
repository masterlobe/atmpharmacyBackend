require("dotenv").config();
const express = require('express')
const mongoose = require('mongoose')
const Product = require('./routes/Product')
const Mail = require('./routes/Mail')
const cors = require("cors");


const app = express();

mongoose.connect('mongodb+srv://atmpharmacy:6zRR4BnDwFa8k11f@cluster0.ezaag99.mongodb.net/')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err))

app.use(express.json())
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use('/product', Product)

app.use('/mail', Mail)
app.use('/contact', require("./Routes/contact"))

app.get('/', (req, res) => {
  res.send('Hello World!')
  console.log('Root endpoint was hit')
})



app.listen(5500, () => {
  console.log('Server running on port 5500')
})
