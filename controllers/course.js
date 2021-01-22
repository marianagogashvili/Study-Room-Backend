const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Mongoose = require('mongoose')

const Course = require("../models/course");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Group = require("../models/group");

exports.createCourse = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed.');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}

		const teacherId = req.body.teacherId;
		const title = req.body.title;
		const description = req.body.description;
		const key = req.body.key;
		const groupName = req.body.groupName;
		const students = req.body.students;

		const course = new Course({
			title: title,
			description: description,
			key: key,
			creator: teacherId
		});

		await course.save();

		await Teacher.findByIdAndUpdate(teacherId, { $push: { courses: course }});

		if (students.length !== []) {
			students.forEach(async (s) => {
				course.students.push(s);
				await Student.findByIdAndUpdate(s._id, { $push: { courses: course } });
			});
		}

		await course.save();

		if (groupName !== '') {
			const group = await Group.find({name: groupName});
			const studs = await Student.find({ group: group });
			studs.forEach(async (s)  => {
				course.students.push(s);
				await Student.findByIdAndUpdate(s._id, { $push: { courses: course } });
			});
		}

		await course.save();

		res.status(201).json('Course was created successfully');
		
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.getCourse = async (req, res, next) => {
	try {	
		const id = req.body.id;
		const course = await Course.findById(Mongoose.Types.ObjectId(id)).populate('creator');
		if (course) {
			res.status(200).json(course); 
		} else {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.editCourse = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed.');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const id = req.body.id;
		const title = req.body.title;
		const key = req.body.key;
		const description = req.body.description;

		const course = await Course.findById(id);
		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}
		if (course.creator === id) {
			course.title = title;
			course.key = key;
			course.description = description;
			await course.save();
		} else {
			const err = new Error();
			err.status = 404;
			err.data = 'Permission denied';
			throw err;
		}
		// const result = await Course.findByIdAndUpdate(id, {title: title, key: key, description: description});
		res.status(200).json({message: "Course was updated successfully"}); 
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}
