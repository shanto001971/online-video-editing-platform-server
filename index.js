const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

const cors = require('cors');
require('dotenv').config();

// middleware
const corsOptions = {
	origin: '*',
	credentials: true,
	optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// videoEditor
// AQGTtFpcUjcrPWab

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yg908g2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		// await client.connect();

		const imagesCollection = client
			.db('videoEditor')
			.collection('demoImgData');
		const musicCollection = client
			.db('videoEditor')
			.collection('demoMusicData');
		const templateCollection = client
			.db('videoEditor')
			.collection('demoTemplateData');
		const videoCollection = client
			.db('videoEditor')
			.collection('demoVideoData');

		app.get('/demoImages', async (req, res) => {
			const result = await imagesCollection.find().toArray();
			res.send(result);
		});
		app.get('/demoMusics', async (req, res) => {
			const result = await musicCollection.find().toArray();
			res.send(result);
		});
		app.get('/demoTemplates', async (req, res) => {
			const result = await templateCollection.find().toArray();
			res.send(result);
		});
		app.get('/demoVideos', async (req, res) => {
			const result = await videoCollection.find().toArray();
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

app.get('/', (req, res) => {
	res.send('Hello my dear Online video editor');
});

app.listen(port, () => {
	console.log('Hello I am from online video editor server');
});
