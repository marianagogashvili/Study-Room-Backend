const Mongoose = require('mongoose');
const Teacher = require('../models/teacher');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Student = require('../models/student');

exports.getTeacher = async (req, res, next) => {
	try {
		const teacherId = req.body.id;
		const teacher = await Teacher.findById(Mongoose.Types.ObjectId(teacherId)).populate('courses');
		if (!teacher) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This teacher does not exist';
			throw error;
		} else {
			res.status(201).json(teacher);
		}
	} catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.editTeacher = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error();
			error.statusCode = 422;
			error.data  = errors.array();
			throw error;
		}

		const id = req.body.id;
		const login = req.body.login;

		const checkLogin = await Teacher.findOne({login:login});
		if (checkLogin !== null && checkLogin.id.toString() !== id) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = [{param: 'login', msg:'Login is already taken'}];
			throw error;
		}

		const fullName = req.body.fullName;
		const oldPassword = req.body.oldPassword;
		const newPassword = req.body.newPassword;

		const teacher = await Teacher.findById(Mongoose.Types.ObjectId(id));
		
		if (!teacher) {       
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This teacher does not exist';
			throw error;
		} else {
			const passIsCorrect = await bcrypt.compare(oldPassword, teacher.password);
			if (!passIsCorrect) {
				const error = new Error();
				error.statusCode = 422;
				error.data  = [{ param: 'oldPassword', msg: 'Old password is incorrect'}];
				throw error;
			} else {
				teacher.login = login;
				teacher.fullName = fullName;
				const hashedPass = await bcrypt.hash(newPassword, 12);
				teacher.password = hashedPass;
				const result = await teacher.save();
				res.status(200).json({message: 'Teacher was updated successfully'});
				
			}
		}
	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.findStudent = async (req, res, next) => {
	try {
		const name = req.body.name;
		let student = {};
		student = await Student.find({'fullName': {$regex:  name , $options: "i"}}).limit(5).populate('group');
		res.status(201).json(student);
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

