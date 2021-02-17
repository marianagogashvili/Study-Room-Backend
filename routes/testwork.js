const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const testworkController = require('../controllers/testwork');
const Testwork = require('../models/testwork');
const isAuthTeacher = require('../middleware/is-auth-teacher');
const isAuth = require('../middleware/is-auth');

router.post('/createTest', isAuthTeacher, testworkController.createTest);

router.post('/updateTest', isAuthTeacher, testworkController.updateTest);

router.post('/deleteTest', isAuthTeacher, testworkController.deleteTest);

router.post('/getTest', isAuth, testworkController.getTest);

module.exports = router;