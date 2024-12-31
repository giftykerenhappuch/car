require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');  // Import multer for handling file uploads
const app = express();
const cors = require('cors');
app.use(cors());

// Use Render's dynamic PORT if available
const port = process.env.PORT || 3001;

// Load MongoDB URI from environment variables
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());  // To parse JSON request body
app.use(express.urlencoded({ extended: true }));  // To parse URL-encoded data

// Set up multer for storing uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Car Schema
const carSchema = new mongoose.Schema({
    carName: { type: String, required: true },
    ownerName: { type: String, required: true },
    carType: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: false }  // Path to the uploaded image
});

// Car Model
const Car = mongoose.model('Car', carSchema);

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from 'uploads' folder for image access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET all cars from MongoDB
app.get('/api/cars', async (req, res) => {
    try {
        const cars = await Car.find();
        res.status(200).json(cars);
    } catch (err) {
        console.error('Error retrieving cars:', err);
        res.status(500).send('Error retrieving cars');
    }
});

// POST a new car (Admin Functionality)
app.post('/api/cars', upload.single('image'), async (req, res) => {
    try {
        // Get car data from the request body
        const { carName, ownerName, carType, price } = req.body;
        const imagePath = req.file ? '/uploads/' + req.file.filename : null;

        // Create a new car entry
        const newCar = new Car({
            carName,
            ownerName,
            carType,
            price,
            image: imagePath
        });

        // Save to MongoDB
        await newCar.save();
        res.status(201).json(newCar);
    } catch (err) {
        console.error('Error saving car:', err);
        res.status(500).send('Error saving car');
    }
});

// Health Check Endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).send('Health Check Passed');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Connect to MongoDB
mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });
