const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
const { v4: uuidv4 } = require('uuid');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: '*', // Update to the actual domain of your frontend app
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

const uri = "mongodb+srv://moxie5dev:Ob7Ww5HY7w9W5sLp@navis.1ie1dmm.mongodb.net/?retryWrites=true&w=majority&appName=navis";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    ssl: true
});

async function connectToDatabase() {
    try {
        await client.connect();
        await client.db("navis_db").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to the server!");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

connectToDatabase().catch(console.dir);

// // Set up multer for handling file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Endpoint to handle image uploads
// app.post('/upload', upload.single('file'), async (req, res) => {
//     try {
//         const file = req.file;
//         if (!file) {
//             return res.status(400).send('No file uploaded.');
//         }

//         console.log('File received:', file.originalname);

//         const filename = `${Date.now()}-${file.originalname}`;
//         const fileUpload = bucket.file(filename);

//         const blobStream = fileUpload.createWriteStream({
//             metadata: {
//                 contentType: file.mimetype
//             }
//         });

//         blobStream.on('error', (error) => {
//             console.error('Error uploading image:', error);
//             res.status(500).send('Error uploading image');
//         });

//         blobStream.on('finish', async () => {
//             try {
//                 await fileUpload.makePublic();
//                 const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
//                 console.log("Image link:", imageUrl);
//                 res.json({ imageUrl });
//             } catch (error) {
//                 console.error('Error making image public:', error);
//                 res.status(500).send('Error making image public');
//             }
//         });

//         blobStream.end(file.buffer);
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         res.status(500).send('Error uploading image');
//     }
// });


app.get('/deliveries', async (req, res) => {
    try {
        const database = client.db('navis_db');
        const collection = database.collection('deliveries');
        const deliveries = await collection.find().limit(1000).toArray();
        res.json(deliveries);
    } catch (error) {
        res.status(500).send('Error fetching deliveries');
    }
});

app.get('/users', async (req, res) => {
    try {
        const database = client.db('navis_db');
        const collection = database.collection('navis_users');
        const users = await collection.find().limit(1000).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).send('Error fetching users');
    }
});

app.get('/drivers', async (req, res) => {
    try {
        const database = client.db('navis_db');
        const collection = database.collection('drivers');
        const drivers = await collection.find().limit(1000).toArray();
        res.json(drivers);
    } catch (error) {
        res.status(500).send('Error fetching drivers');
    }
});


app.get('/navis_users', async (req, res) => {
    try {
      const username = req.query.username;
      const user = await UserModel.findOne({ username: username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });


app.get('/non_user_requests', async (req, res) => {
    try {
        const database = client.db('navis_db');
        const collection = database.collection('non_user_requests');
        const requests = await collection.find().limit(1000).toArray();
        res.json(requests);
    } catch (error) {
        res.status(500).send('Error fetching non-user requests');
    }
});

app.post('/updateDeliveryStatus', async (req, res) => {
    try {
        const { uid, status } = req.body;
        const database = client.db('navis_db');
        const collection = database.collection('non_user_requests');
        await collection.updateOne({ uid: uid }, { $set: { status: status } });
        res.send('Delivery status updated');
    } catch (error) {
        res.status(500).send('Error updating delivery status');
    }
});

app.post('/saveNonUserRequests', async (req, res) => {
    try {
        const reqData = req.body;
        const database = client.db('navis_db');
        const collection = database.collection('non_user_requests');
        await collection.insertOne({ uid: uuidv4(), ...reqData });
        res.send('Request data saved');
    } catch (error) {
        res.status(500).send('Error saving request data');
    }
});

app.post('/saveDriverData', async (req, res) => {
    try {
        const driverData = req.body;
        const database = client.db('navis_db');
        const collection = database.collection('drivers');
        await collection.insertOne(driverData);
        res.send('Driver data saved');
    } catch (error) {
        res.status(500).send('Error saving driver data');
    }
});

app.post('/fetchTrucks', async (req, res) => {
    try {
        const { company } = req.body;
        const database = client.db('navis_db');
        const collection = database.collection('trucks');
        const trucks = await collection.find({ company: company }).limit(1000).toArray();
        res.json(trucks);
    } catch (error) {
        res.status(500).send('Error fetching trucks');
    }
});

app.post('/saveTruckData', async (req, res) => {
    try {
        const truckData = req.body;
        const database = client.db('navis_db');
        const collection = database.collection('trucks');
        await collection.insertOne(truckData);
        res.send('Truck data saved');
    } catch (error) {
        res.status(500).send('Error saving truck data');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const database = client.db('navis_db');
        const collection = database.collection('navis_users');
        
        // Find the user by username
        const user = await collection.findOne({ username: username });
        
        // If user is not found or password does not match, send 401 status
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // If user is found and password matches, return user object
        res.json(user);
    } catch (error) {
        console.error("Error logging in:", error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, company, password, accountType, imageUrl } = req.body;
        const userData = { username, email, company, password, accountType, imageUrl };
        const database = client.db('navis_db');
        const collection = database.collection('navis_users');
        await collection.insertOne(userData);
        res.send('User registered');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port:${port}`);
});
