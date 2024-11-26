const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
const { v4: uuidv4 } = require('uuid');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
    cors({
      origin: "*", // Allow all origins
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
      ],
      credentials: false,
    })
  );
  
  app.options("*", cors()); // Enable pre-flight across-the-board
  

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


app.get('/trucks', async (req, res) => {
    try {
        const database = client.db('navis_db');
        const collection = database.collection('trucks');
        const trucks = await collection.find().limit(1000).toArray();
        res.json(trucks);
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


app.get('/all_assigments', async (req, res) => {
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
console.log("")

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

app.post('/assignments', async (req, res) => {
    try {
        const { driverId, truckId } = req.body;

        if (!driverId || !truckId) {
            return res.status(400).json({ message: 'Driver ID and Truck ID are required' });
        }

        const database = client.db('navis_db');

        // Fetch driver and truck
        const driver = await database.collection('drivers').findOne({ _id: new ObjectId(driverId) });
        const truck = await database.collection('trucks').findOne({ _id: new ObjectId(truckId) });

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        if (!truck) {
            return res.status(404).json({ message: 'Truck not found' });
        }

        if (driver.truckId && driver.truckId.toString() !== truckId.toString()) {
            return res.status(400).json({ message: 'Driver is already assigned to another truck' });
        }

        if (truck.driverId && truck.driverId.toString() !== driverId.toString()) {
            return res.status(400).json({ message: 'Truck is already assigned to another driver' });
        }

        await database.collection('drivers').updateOne({ _id: new ObjectId(driverId) }, { $set: { truckId: truckId } });
        await database.collection('trucks').updateOne({ _id: new ObjectId(truckId) }, { $set: { driverId: driverId } });

        res.status(200).json({ message: 'Driver assigned to truck successfully' });
    } catch (error) {
        console.error('Error assigning driver to truck:', error.message);
        res.status(500).json({ message: 'Error assigning driver to truck' });
    }
});


// app.post('/track-position', asyncHandler(async (req, res) => {
//     const { userId, lat, lng } = req.body;
//     await db.collection('driver_positions').updateOne(
//       { userId },
//       { $set: { lat, lng, timestamp: new Date() } },
//       { upsert: true }
//     );
//     res.status(200).send('Position updated');
//   }));


// Endpoint to start a trip
// app.post('/non_user_requests/:uid/start', asyncHandler(async (req, res) => {
//     const tripId = req.params.tripId;
//     await db.collection('trips').updateOne(
//       { _id: tripId },
//       { $set: { status: 'started' } }
//     );
//     res.status(200).send('Trip started');
//   }));
  

//   app.get('/non_user_requests/:driverId', asyncHandler(async (req, res) => {
//     const driverId = req.params.driverId;
//     const trips = await db.collection('trips').find({ driverId }).toArray();
//     res.json(trips || []);
//   }));


app.patch('/non_user_requests/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { status } = req.body;
        const database = client.db('navis_db');
        const collection = database.collection('non_user_requests');
        const result = await collection.updateOne(
            { uid: uid },
            { $set: { status: status } }
        );
        if (result.modifiedCount > 0) {
            res.status(200).send('Status updated successfully');
        } else {
            res.status(404).send('Delivery not found');
        }
    } catch (error) {
        res.status(500).send('Error updating delivery status');
    }
});

app.get('/driver/:uid', async (req, res) => {
    try {
        const database = client.db('navis_db');
        const collection = database.collection('drivers');
        
        const driverId = req.params.uid;  // Extract the driver ID from the request parameters
        const request = await collection.findOne({ uid: driverId });  // Find the driver with the specific ID
        
        if (request) {
            res.json(request);
        } else {
            res.status(404).send('Driver not found');
        }
    } catch (error) {
        res.status(500).send('Error fetching driver');
    }
});


app.patch('/drivers/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { plate } = req.body;
        const database = client.db('navis_db');
        const collection = database.collection('drivers');
        const result = await collection.updateOne(
            { uid: uid },
            { $set: { numberPlate: plate } }
        );
        if (result.modifiedCount > 0) {
            res.status(200).send('Truck updated successfully');
        } else {
            res.status(404).send('Truck not found');
        }
    } catch (error) {
        res.status(500).send('Error updating driver truck');
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



app.post('/driver_login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const database = client.db('navis_db');
        const collection = database.collection('drivers');
        
        // Find the user by username
        const user = await collection.findOne({ name: username });
        
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
