const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
	origin: '*',
	credentials: true,
	optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

//TODO: Warning data must be inserted mongodb. Here I implement use just demo
const demoImagesData = require('./data/demoImagesData.json');
const demoVideosData = require('./data/demoVideosData.json');
const templateData = require('./data/templateData.json');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yg908g2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

app.get('/', (req, res) => {
	res.send('Hello my dear Online video editor');
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		// await client.connect();

		const imagesCollection = client
			.db('videoEditor')
			.collection('demoImgData');

		const videosCollection = client
			.db('videoEditor')
			.collection('demoVideoData');

		const templateImgDataCollection = client
			.db('videoEditor')
			.collection('templateImgData');

		const templateVideosDataCollection = client
			.db('videoEditor')
			.collection('templateVideosData');

		const usersCollection = client.db('videoEditor').collection('users');

		app.get('/demoImages', async (req, res) => {
			const result = await imagesCollection.find().toArray();
			res.send(result);
		});

		app.get('/demoVideos', async (req, res) => {
			const result = await videosCollection.find().toArray();
			res.send(result);
		});

		app.get('/templateImgData', async (req, res) => {
			const result = await templateImgDataCollection.find().toArray();
			res.send(result);
		});

		app.get('/templateVideosData', async (req, res) => {
			const result = await templateVideosDataCollection.find().toArray();
			res.send(result);
		});

		app.post('/users', async (req, res) => {
			const user = req.body;

			const query = { email: user.email };
			const existingUser = await usersCollection.findOne(query);

			if (existingUser) {
				return res.send({ message: 'User is already exists' });
			}
			const result = await usersCollection.insertOne(user);
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.listen(port, () => {
	console.log(`online video editor server running on port${port}`);
});

// const usersCollection = client.db("photographDB").collection("users");
