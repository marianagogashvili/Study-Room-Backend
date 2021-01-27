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
		const teacherId = req.body.teacherId;
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

		if (course.creator.toString() === teacherId) {
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
		const result = await Course.findByIdAndUpdate(id, {title: title, key: key, description: description});
		res.status(200).json({message: "Course was updated successfully"}); 
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.getStudents = async (req, res, next) => {
	try {
		const id = req.body.id;
		const students = await Course.findById(Mongoose.Types.ObjectId(id)).populate({ path: 'students', populate: { path: 'group' }});

		res.status(200).json(students); 
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.deleteStudent = async (req, res, next) => {
	try {
		const studentId = req.body.studentId.toString() ;
		const courseId = req.body.courseId.toString() ;

		const student = await Student.findById(Mongoose.Types.ObjectId(studentId));
		if (!student) {
			const err = new Error();
			err.status = 404;
			err.data = 'This student does not exist';
			throw err;
		}

		const course = await Course.findById(Mongoose.Types.ObjectId(courseId));
		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}
		console.log(student);
		console.log(course);

		await student.courses.pull(courseId);
		await student.save();
		await course.students.pull(studentId);
		await course.save();

		res.status(200).json({message: "Student was removed from course"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.findStudentsByParams = async (req, res, next) => {
	const fullName = req.body.fullName;
	const login = req.body.login;
	const groupVal = req.body.group;

	let students = [];
	if (fullName !== '' || login !== '') {
		students = await Student.find().populate('group')
		.and([
	      { 'fullName': {$regex: fullName , $options: "i"} },
	      { 'login': {$regex: login, $options: "i"} }
	    ]);
	}

	let result;
    if (students.length !== 0) {
    	if (groupVal !== '') {
    		result = students.filter(stud => stud.group.name == groupVal);
    	} else {
    		result = students;
    	}
    } else if (students.length === 0) {
    	const group = await Group.findOne({name: groupVal});
 	    result = await Student.find({group: group._id}).populate('group');
    } 
	res.status(200).json(result);
}

exports.addStudents = async (req, res, next) => {
	const course = await Course.findById(req.body.courseId);
	if (!course) {
		const err = new Error();
		err.status = 404;
		err.data = 'This course does not exist';
		throw err;
	}
	const students = req.body.students;

	if (students.length !== []) {
		students.forEach(async (s) => {
			course.students.push(s);
			await Student.findByIdAndUpdate(s._id, { $push: { courses: course } });
		});
	}

	await course.save();
	res.status(201).json({message: "Students added successfully"});

}
