const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const groupRoutes = require('./routes/group');
const courseRoutes = require('./routes/course');
const topicRoutes = require('./routes/topic');
const assignmentRoutes = require('./routes/assignment');
const solutionRoutes = require('./routes/solution');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const fileStorage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, 'assignmentsFolder')
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

app.use(
  multer({storage: fileStorage, fileFilter: fileFilter}).array('file')
 );

app.use('/assignmentsFolder', express.static(path.join(__dirname, 'assignmentsFolder')));

app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/group', groupRoutes);
app.use('/course', courseRoutes);
app.use('/topic', topicRoutes);
app.use('/assignment', assignmentRoutes);
app.use('/solution', solutionRoutes);

app.use((error, req, res, next) => {
  console.log(" Error" , error);
  const status = error.statusCode || 500;
  // const message = error.message;
  const data = error.data;
  console.log(data);

  res.status(status).json(data);
});

mongoose
	.connect(
		'mongodb+srv://mariana:mari2003@cluster0.hfkls.mongodb.net/study-room', {
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }
	)
	.then(result => {
		app.listen(8000);
}).catch(err => console.log(err));
