const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const testworkController = require('../controllers/testwork');
const Testwork = require('../models/testwork');
const isAuthTeacher = require('../middleware/is-auth-teacher');

router.post('/createTest', isAuthTeacher, testworkController.createTest);


module.exports = router;