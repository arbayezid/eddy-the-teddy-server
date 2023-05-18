const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express())


app.get('/', (req,res) =>{
    res.send('Toy Server Is Running')
})

app.listen(port, () =>{
    console.log(`Toy server is running on port: ${port}`)
})