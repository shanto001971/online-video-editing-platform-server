const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');
require('dotenv').config();

app.get('/', (req, res) => {
	res.send('Hello my dear Online video editor');
});

app.listen(port, () => {
	console.log('Hello I am from online video editor server');
});
