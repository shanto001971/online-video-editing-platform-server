const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
	origin: '*',
	credentials: true,
	optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// verify jwt
const verifyJWT = (req, res, next) => {
	const authorization = req.headers.authorization;
	if (!authorization) {
		return res
			.status(401)
			.send({ error: true, message: 'unauthorized access' });
	}
	// bearer token
	const token = authorization.split(' ')[1];

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) {
			return res
				.status(401)
				.send({ error: true, message: 'unauthorised access' });
		}
		req.decoded = decoded;
		next();
	});
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yg908g2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

// this is the payment request method that is used to send payments
// const store_id = process.env.STORE_ID;
// const store_passwd = process.env.STORE_PASSWORD;
// const is_live = false;

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
		const feedbackCollection = client.db('videoEditor').collection('feedback');


		// jwt token 
		app.post('/jwt', (req, res) => {
			const user = req.body;
			const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: '1h',
			});
			res.send({ token });
		});

		// verifyAdmin (middleware)
		const verifyAdmin = async (req, res, next) => {
			const email = req.decoded.email;
			const query = { email: email };
			const user = await usersCollection.findOne(query);
			if (user?.role !== 'admin') {
				return res
					.status(403)
					.send({ error: true, message: 'forbidden message' });
			}
			next();
		};

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

		//TODO: Warning data insert  on the mongodb
		app.get('/demoVideoTemplate', async (req, res) => {
			res.send(demoVideoTemplate);
		});
		app.get('/demoImagesTemplate', async (req, res) => {
			res.send(demoImagesTemplate);
		});
		app.get('/allTemplateData', async (req, res) => {
			res.send(allTemplateData);
		});

		// users api started here 

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

		app.get('/users', verifyJWT, verifyAdmin, async(req, res) => {
			const result = await usersCollection.find().toArray();
			res.send(result);
		})

	//Update user by email in DB
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

		// users api ended here 

		// make admin api
		app.patch('/users/admin/:id', async(req, res) => {
			const id = req.params.id;
			const query = {_id: new ObjectId(id)}
			const updateDoc = {
			  $set: {
				role: 'admin'
			  }
			}
			const result = await usersCollection.updateOne(query, updateDoc)
			res.send(result)
		  })


		// verify admin 
		app.get('/users/admin/:email', verifyJWT, async(req, res) => {
			const email = req.params.email;
			const decodedEmail =  req.decoded.email;
			if(email !== decodedEmail){
			res.send({admin: false})
			}
			const query = {email: email};
			const user = await usersCollection.findOne(query);
			res.send({admin: user?.role === "admin"})
		})

		// user feedback api
		app.post('/feedback', async(req, res) => {
			const feedback = req.body;
			const result = await feedbackCollection.insertOne(feedback);
			res.send(result);
		})

		// Admin statistics for dashborad
		app.get('/admin-stats', verifyJWT, verifyAdmin, async(req, res) => {
			const users = await usersCollection.estimatedDocumentCount();
			const videos = await videosCollection.estimatedDocumentCount();
			const images = await imagesCollection.estimatedDocumentCount();

			// if user paid info is saved into the database
			// const payments = await paymentsCollection.find().toArray();
			// const revenue = payments.reduce((sum, payment) => sum + payment.price, 0)


			res.send({
				users,
				videos,
				images,
				// revenue
			})
		})
		


	  

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
