const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

mongoose
	.connect(
		'mongodb+srv://mariana:mari2003@cluster0.hfkls.mongodb.net/study-room', {useUnifiedTopology: true, useNewUrlParser: true}
	)
	.then(result => {
		app.listen(8000);
}).catch(err => console.log(err));
