const express = require('express');
const solutionController = require('../controllers/solution');
const { body } = require('express-validator');
const isAuthTeacher = require('../middleware/is-auth-teacher');
const isAuthStudent = require('../middleware/is-auth-student');

const Solution = require('../models/solution');

const router = express.Router();

router.post('/createSolution', isAuthStudent, solutionController.createSolution);

module.exports = router;