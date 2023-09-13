const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
//const SSLCommerzPayment = require('sslcommerz-lts');
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

//TODO: Warning data insert  on the mongodb
// const demoVideoTemplate = require('./data/templateVideosData.json');
// const demoImagesTemplate = require('./data/templateImagesData.json');
// const allTemplateData = require('./data/allTemplateData.json');

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
		// Warning data insert  on the mongodb
		app.get('/demoVideoTemplate', async (req, res) => {
			const result = await demoVideoTemplate.find().toArray();
			res.send(result);
		});
		app.get('/demoImagesTemplate', async (req, res) => {
			const result = await demoImagesTemplate.find().toArray();
			res.send(result);
		});
		app.get('/allTemplateData', async (req, res) => {
			const result = await allTemplateData.find().toArray();
			res.send(result);
		});

		// Payment methods api is here
		// const tran_id = new ObjectId().toString();
		// app.post('/payments', async (req, res) => {
		// 	const value = req.body;
		// 	const price = value.price;
		// 	const data = {
		// 		total_amount: price,
		// 		currency: 'BDT',
		// 		tran_id: tran_id, // use unique tran_id for each api call
		// 		success_url: 'http://localhost:3030/success',
		// 		fail_url: 'http://localhost:3030/fail',
		// 		cancel_url: 'http://localhost:3030/cancel',
		// 		ipn_url: 'http://localhost:3030/ipn',
		// 		shipping_method: 'Courier',
		// 		product_name: 'Computer.',
		// 		product_category: 'Electronic',
		// 		product_profile: 'general',
		// 		cus_name: 'Customer Name',
		// 		cus_email: 'customer@example.com',
		// 		cus_add1: 'Dhaka',
		// 		cus_add2: 'Dhaka',
		// 		cus_city: 'Dhaka',
		// 		cus_state: 'Dhaka',
		// 		cus_postcode: '1000',
		// 		cus_country: 'Bangladesh',
		// 		cus_phone: '01711111111',
		// 		cus_fax: '01711111111',
		// 		ship_name: 'Customer Name',
		// 		ship_add1: 'Dhaka',
		// 		ship_add2: 'Dhaka',
		// 		ship_city: 'Dhaka',
		// 		ship_state: 'Dhaka',
		// 		ship_postcode: 1000,
		// 		ship_country: 'Bangladesh',
		// 	};
		// 	console.log(data);
		// 	const sslcz = new SSLCommerzPayment(
		// 		store_id,
		// 		store_passwd,
		// 		is_live
		// 	);
		// 	sslcz.init(data).then((apiResponse) => {
		// 		// Redirect the user to payment gateway
		// 		let GatewayPageURL = apiResponse.GatewayPageURL;
		// 		res.send({ url: GatewayPageURL });
		// 		console.log('Redirecting to: ', GatewayPageURL);
		// 	});
		// });

		app.get('/templateImgData', async (req, res) => {
			const result = await templateImgDataCollection.find().toArray();
			res.send(result);
		});

		app.get('/templateVideosData', async (req, res) => {
			const result = await templateVideosDataCollection.find().toArray();
			res.send(result);
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

		// user feedback apis
		app.post('/feedback', async(req, res) => {
			const feedback = req.body;
			const result = await feedbackCollection.insertOne(feedback);
			res.send(result);
		})

		app.get('/feedback', async(req, res) => {
			const result = await feedbackCollection.find().toArray();
			res.send(result);
		})

		// Admin statistics for dashborad ( verifyJWT, verifyAdmin,)
		app.get('/admin-stats', async(req, res) => {
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
		
		// Admin chart for dashborad ( verifyJWT, verifyAdmin,)
		app.get('/admin-chart', async(req, res) => {
			const users = await usersCollection.estimatedDocumentCount();
			const videos = await videosCollection.estimatedDocumentCount();
			const images = await imagesCollection.estimatedDocumentCount();

			// if user paid info is saved into the database
			// const payments = await paymentsCollection.find().toArray();
			// const revenue = payments.reduce((sum, payment) => sum + payment.price, 0)
			
			const dataChart = [
				users,
				videos,
				images,
				// revenue
			  ];

			res.send(dataChart)
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
