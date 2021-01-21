const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Mongoose = require('mongoose');
const Student = require('../models/student');

exports.getStudent = async (req, res, next) => {
	try {
		const studentId = req.body.id;
		const student = await Student.findById(Mongoose.Types.ObjectId(studentId)).populate('group').populate('courses');
		if (!student) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This student does not exist';
			throw error;
		} else {
			res.status(201).json(student);
		}
	} catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.editStudent = async (req, res, next) => {
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

		const checkLogin = await Student.findOne({login:login});
		if (checkLogin !== null && checkLogin.id.toString() !== id) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = [{param: 'login', msg:'Login is already taken'}];
			throw error;
		}

		const fullName = req.body.fullName;
		const oldPassword = req.body.oldPassword;
		const newPassword = req.body.newPassword;

		const student = await Student.findById(Mongoose.Types.ObjectId(id));

		if (!student) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This student does not exist';
			throw error;
		} else {
			const passIsCorrect = await bcrypt.compare(oldPassword, student.password);
			if (!passIsCorrect) {
				const error = new Error();
				error.statusCode = 422;
				error.data  = [{ param: 'oldPassword', msg: 'Old password is incorrect'}];
				throw error;
			} else {
				student.login = login;
				student.fullName = fullName;
				const hashedPass = await bcrypt.hash(newPassword, 12);
				student.password = hashedPass;
				const result = await student.save();
				res.status(200).json({message: 'Student was updated successfully', student: student});
			}
		}
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

