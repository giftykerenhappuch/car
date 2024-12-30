const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Require path module to handle file paths properly

const app = express();

// Use Render's dynamic PORT if available
const port = process.env.PORT || 3001;

// Connect to MongoDB using the MONGO_URI from environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://giftykerenhappuchcug22it:kerenhait7@car.a3zwv.mongodb.net/';
mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Error connecting to MongoDB', err));

// Car Schema
const carSchema = new mongoose.Schema({
    carName: String,
    ownerName: String,
    carType: String,
    price: Number,
    image: String
});

const Car = mongoose.model('Car', carSchema);

// Middleware to parse JSON data
app.use(express.json());

// Serve static files (CSS, images, JS, etc.) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file (render the front-end page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET request to get all cars
app.get('/api/cars', async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars);  // Send car data as a response
    } catch (err) {
        res.status(500).send('Error retrieving cars');
    }
});

// POST request to add new car listing (for admin)
app.post('/api/cars', async (req, res) => {
    try {
        const newCar = new Car(req.body);
        await newCar.save();
        res.status(201).send('Car added successfully');
    } catch (err) {
        res.status(500).send('Error adding car');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
