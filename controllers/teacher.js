const Mongoose = require('mongoose');
const Teacher = require('../models/teacher');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.getTeacher = async (req, res, next) => {
	try {
		const teacherId = req.body.id;
		const teacher = await Teacher.findById(Mongoose.Types.ObjectId(teacherId));
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
		const fullName = req.body.fullName;
		const oldPassword = req.body.login;
		const newPassword = req.body.login;

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
				error.data  = 'Old password is incorrect';
				throw error;
			} else {
				teacher.login = login;
				teacher.fullName = fullName;
				teacher.password = newPassword;
				const result = await teacher.save();
				if (result) {
					res.status(200).json({message: 'Teacher was updated successfully'});
				} else {
					const error = new Error();
					error.statusCode = 404;
					error.data  = 'Teacher was not updated';
					throw error;
				}
			}
		}
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

