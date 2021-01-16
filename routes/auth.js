const express = require('express');
const authController = require('../controllers/auth');
const { body } = require('express-validator');

const Student = require('../models/student');
const Teacher = require('../models/teacher');

const router = express.Router();

router.post('/register',
 [
 	body('fullName')
 		.not().isEmpty(), 
 	body('login')
 		.trim()
 		.isLength({min: 3}).withMessage('Login is too short')
 		.not().isEmpty().withMessage('Login is empty')
 		.custom(async (value, { req }) => {
	 		const student = await Student.findOne({login: value});
	 		const teacher = await Teacher.findOne({login: value});
	 		if (student || teacher) {
	 			const error = new Error('Login is already taken');
	 			throw error;
	 		}
	 	}), 
 	body('password')
 		.trim()
 		.isLength({min: 3}).withMessage('Password is too short')
 		.not().isEmpty().withMessage('Password is empty') 
 ],
 authController.register);

router.post('/login', [
 	body('login')
 		.trim()
 	    .isLength({min: 3}).withMessage('Login is too short')
 		.not().isEmpty().withMessage('Login is empty'),
 	body('password')
 		.trim()
 		.isLength({min: 3}).withMessage('Password is too short')
 		.not().isEmpty().withMessage('Password is empty') 		
 ],
 authController.login);

// router.post('/checkUser', isAuth, authController.checkUser);

module.exports = router;