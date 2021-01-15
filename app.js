const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');

const app = express();
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(" Error" , error);
  const status = error.statusCode || 500;
  // const message = error.message;
  const data = error.data;
  // console.log(data);

  res.status(status).json(data);
});

mongoose
	.connect(
		'mongodb+srv://mariana:mari2003@cluster0.hfkls.mongodb.net/study-room', {useUnifiedTopology: true, useNewUrlParser: true}
	)
	.then(result => {
		app.listen(8000);
}).catch(err => console.log(err));
