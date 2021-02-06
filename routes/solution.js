const express = require('express');
const solutionController = require('../controllers/solution');
const { body } = require('express-validator');
const isAuthTeacher = require('../middleware/is-auth-teacher');
const isAuthStudent = require('../middleware/is-auth-student');
const isAuth = require('../middleware/is-auth');

const Solution = require('../models/solution');

const router = express.Router();

router.post('/createSolution', isAuthStudent, solutionController.createSolution);

router.post('/getSolutionStudent', isAuthStudent, solutionController.getSolutionStudent);

router.post('/getSolutionsTeacher', isAuthTeacher, solutionController.getSolutionsTeacher);

router.post('/updateSolutionTeacher', isAuthTeacher, solutionController.updateSolutionTeacher);

router.post('/updateSolutionStudent', isAuthStudent, solutionController.updateSolutionStudent);

router.post('/deleteSolution', isAuthStudent, solutionController.deleteSolution);

module.exports = router;