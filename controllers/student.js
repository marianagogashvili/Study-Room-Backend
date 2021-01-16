const Mongoose = require('mongoose');
const Student = require('../models/student');

exports.getStudent = async (req, res, next) => {
	try {
		const studentId = req.body.id;
		const student = await Student.findById(Mongoose.Types.ObjectId(studentId));
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
		const fullName = req.body.fullName;
		const className = req.body.class;
		const oldPassword = req.body.login;
		const newPassword = req.body.login;

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
				error.data  = 'Old password is incorrect';
				throw error;
			} else {
				student.login = login;
				student.fullName = fullName;
				student.class = className;
				student.password = newPassword;
				const result = await student.save();
				if (result) {
					res.status(200).json({message: 'Student was updated successfully'});
				} else {
					const error = new Error();
					error.statusCode = 404;
					error.data  = 'Student was not updated';
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
