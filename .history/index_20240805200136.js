const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: '*', // Allow requests from any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these methods
    allowedHeaders: ['Content-Type'], // Allow these headers
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
      console.log("Pinged your deployment. You successfully connected to ther server!");
      console.log("Connected to MongoDB");
    } finally {
        await client.close();
      }
  }
  
  connectToDatabase().catch(console.dir);


  let gfs;
client.connect().then(() => {
    const db = client.db('navis_db');
    gfs = Grid(db, MongoClient);
    gfs.collection('media'); // Collection name for GridFS files
}).catch(err => console.error("Error connecting to MongoDB:", err));

// Set up GridFS storage with multer
const storage = GridFsStorage({
    url: uri,
    file: (req, file) => {
        return {
            bucketName: 'uploads', // Bucket name for GridFS
            filename: file.originalname,
        };
    },
});

const upload = multer({ storage });

// Endpoint to handle image uploads
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }
        const imageUrl = `${uri}/uploads/${file.filename}`; // URL to access the file
        res.json({ imageUrl });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).send('Error uploading image');
    }
});

// Endpoint to serve files from GridFS
app.get('/uploads/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ err: 'No file exists' });
        }
        // Read output to response
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    });
});

app.get('/deliveries', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('navis_db');
    const collection = database.collection('deliveries');
    const deliveries = await collection.find().limit(1000).toArray();
    res.json(deliveries);
  } catch (error) {
    res.status(500).send('Error fetching deliveries');
  } finally {
    await client.close();
  }
});

app.get('/non_user_requests', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('navis_db');
    const collection = database.collection('non_user_requests');
    const requests = await collection.find().limit(1000).toArray();
    res.json(requests);
  } catch (error) {
    res.status(500).send('Error fetching non-user requests');
  } finally {
    await client.close();
  }
});

app.post('/updateDeliveryStatus', async (req, res) => {
  try {
    await client.connect();
    const { uid, status } = req.body;
    const database = client.db('navis_db');
    const collection = database.collection('non_user_requests');
    await collection.updateOne({ uid: uid }, { $set: { status: status } });
    res.send('Delivery status updated');
  } catch (error) {
    res.status(500).send('Error updating delivery status');
  } finally {
    await client.close();
  }
});

app.post('/saveNonUserRequests', async (req, res) => {
  try {
    await client.connect();
    const reqData = req.body;
    const database = client.db('navis_db');
    const collection = database.collection('non_user_requests');
    await collection.insertOne({ uid: uuidv4(), ...reqData });
    res.send('Request data saved');
  } catch (error) {
    res.status(500).send('Error saving request data');
  } finally {
    await client.close();
  }
});

app.post('/saveDriverData', async (req, res) => {
  try {
    await client.connect();
    const driverData = req.body;
    const database = client.db('navis_db');
    const collection = database.collection('drivers');
    await collection.insertOne(driverData);
    res.send('Driver data saved');
  } catch (error) {
    res.status(500).send('Error saving driver data');
  } finally {
    await client.close();
  }
});

app.post('/fetchTrucks', async (req, res) => {
  try {
    await client.connect();
    const { company } = req.body;
    const database = client.db('navis_db');
    const collection = database.collection('trucks');
    const trucks = await collection.find({ company: company }).limit(1000).toArray();
    res.json(trucks);
  } catch (error) {
    res.status(500).send('Error fetching trucks');
  } finally {
    await client.close();
  }
});

app.post('/saveTruckData', async (req, res) => {
  try {
    await client.connect();
    const truckData = req.body;
    const database = client.db('navis_db');
    const collection = database.collection('trucks');
    await collection.insertOne(truckData);
    res.send('Truck data saved');
  } catch (error) {
    res.status(500).send('Error saving truck data');
  } finally {
    await client.close();
  }
});

app.post('/login', async (req, res) => {
  try {
    await client.connect();
    const { username, password } = req.body;
    const database = client.db('navis_db');
    const collection = database.collection('users');
    const user = await collection.findOne({ username: username });
    if (user && user.password === password) {
      res.json(user);
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Error logging in');
  } finally {
    await client.close();
  }
});

app.post('/register', async (req, res) => {
  try {
    await client.connect();
    const { username, email, company, password, accountType, imageUrl } = req.body;
    const userData = { username, email, company, password, accountType, imageUrl };
    const database = client.db('navis_db');
    const collection = database.collection('users');
    await collection.insertOne(userData);
    res.send('User registered');
  } catch (error) {
    res.status(500).send('Error registering user');
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
