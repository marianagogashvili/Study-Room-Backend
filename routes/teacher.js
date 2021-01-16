const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const teacherController = require('../controllers/teacher');
const Teacher = require('../models/teacher');
const isAuth = require('../middleware/is-auth-teacher');

router.post('/getTeacher', isAuth, teacherController.getTeacher);

router.put('/editTeacher', [
	body('fullName')
		.not().isEmpty().withMessage('Name is empty') ,
	body('login')
		.not().isEmpty().withMessage('Login is empty')
		.custom(async (value, { req }) => {
			const teacher = await Teacher.find({login: value});
			if (teacher) {
				const error = new Error('Login is already taken');
				throw error;
			}
	}),
	body('oldPassword').not().isEmpty().withMessage('Old password field is empty'),
	body('newPassword').not().isEmpty().withMessage('Password is empty'),

], isAuth, teacherController.editTeacher);


module.exports = router;