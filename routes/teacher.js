const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const teacherController = require('../controllers/teacher');
const Teacher = require('../models/teacher');
const isAuth = require('../middleware/is-auth-teacher');

router.get('/getTeacher', isAuth, teacherController.getTeacher);

router.put('/editTeacher', [
	body('fullName')
		.not().isEmpty().withMessage('Name is empty') ,
	body('login')
		.not().isEmpty().withMessage('Login is empty'),
	body('oldPassword').not().isEmpty().withMessage('Old password field is empty'),
	body('newPassword').not().isEmpty().withMessage('Password is empty'),

], isAuth, teacherController.editTeacher);

router.post('/findStudent', isAuth, teacherController.findStudent);


module.exports = router;