require("dotenv").config();
const express = require('express')
const mongoose = require('mongoose')
const Product = require('./Routes/Product')
const Mail = require('./Routes/Mail')
const cors = require("cors");


const app = express();

mongoose.connect('mongodb+srv://atmpharmacy:6zRR4BnDwFa8k11f@cluster0.ezaag99.mongodb.net/')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err))

app.use(express.json())
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));

app.use('/product', Product)

app.use('/mail', Mail)
app.use('/contact', require("./Routes/contact"))
app.use('/aayucontact', require("./Routes/aayucontact"))

app.get('/', (req, res) => {
  res.send('Hello World!')
  console.log('Root endpoint was hit')
})

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
