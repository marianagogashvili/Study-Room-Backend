const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const studentController = require('../controllers/student');
const isAuth = require('../middleware/is-auth-student');

const Student = require('../models/student');

router.get('/getStudent', isAuth, studentController.getStudent);

router.put('/editStudent', [
	body('fullName')
		.not().isEmpty().withMessage('Name is empty') ,
	body('login')
		.not().isEmpty().withMessage('Login is empty'),
	body('oldPassword').not().isEmpty().withMessage('Old password field is empty'),
	body('newPassword').not().isEmpty().withMessage('Password is empty'),

], isAuth, studentController.editStudent);

router.get('/getGrades', isAuth, studentController.getGrades);

router.get('/getAssignments', isAuth, studentController.getAssignments);

module.exports = router;