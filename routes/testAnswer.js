const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const testAnswerController = require('../controllers/testAnswer');
const TestAnswer = require('../models/testAnswer');

const isAuthStudent = require('../middleware/is-auth-student');
const isAuthTeacher = require('../middleware/is-auth-teacher');
const isAuth = require('../middleware/is-auth');

router.post('/saveAnswers', isAuthStudent, testAnswerController.saveAnswers);

router.post('/getAnswers', isAuth, testAnswerController.getAnswers);

module.exports = router;