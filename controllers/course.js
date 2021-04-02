const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Mongoose = require('mongoose')

const Course = require("../models/course");
const Field = require("../models/field");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Assignment = require("../models/assignment");
const Article = require("../models/article");
const Post = require("../models/post");
const Solution = require("../models/solution");
const Testwork = require("../models/testwork");
const Notification = require("../models/notification");

const Group = require("../models/group");

let checkCourseOwner = (creator, teacherId) => {
	if (creator !== teacherId) {
		const err = new Error();
		err.status = 404;
		err.data = 'Permission denied';
		throw err;
	}
}


exports.getAllCourses = async (req, res, next) => {
	const courses = await Course.find();
	res.status(200).json(courses);
}

exports.searchCourses = async (req, res, next) => {
	const courseName = req.body.title;
	const courses = await Course.find({title: {$regex: courseName.trim().toLowerCase(), $options: "i"}}).populate('field');
	
	res.status(200).json(courses);
}

exports.createCourse = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed.');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}

		const title = req.body.title;
		const description = req.body.description;
		const key = req.body.key;
		const opened = req.body.opened;
		const groupName = req.body.groupName;
		const fieldName = req.body.fieldName;
		const students = req.body.students;

		const field = await Field.findOne({name: fieldName});

		const course = new Course({
			title: title,
			description: description,
			key: key,
			opened: opened,
			creator: req.userId,
			field: field._id
		});

		await course.save();

		await Teacher.findByIdAndUpdate(req.userId, { $push: { courses: course }});

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

		const notification = new Notification({
			title: course.title,
			description: "created",
			user: req.userId,
			courseId: course._id,
			type: "course"
		});
		await notification.save();

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
		const course = await Course
			.findById(Mongoose.Types.ObjectId(id))
			.populate('creator')
			.populate('field')
			.populate({ path: 'students', populate: { path: 'group' }, options: {sort: {'fullName': 1} }})
			.populate({ path: 'requests', populate: { path: 'group' }});

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
		const opened = req.body.opened;
		const key = req.body.key;
		const fieldName = req.body.field;
		const description = req.body.description;

		const field = await Field.findOne({name: fieldName});

		const course = await Course.findById(id);

		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}

		checkCourseOwner(course.creator.toString(), req.userId);

		course.title = title;
		course.key = key;
		course.description = description;
		course.opened = opened;
		course.field = field;
		await course.save();

		const notification = new Notification({
			title: course.title,
			description: "updated",
			user: req.userId,
			courseId: course._id,
			type: "course"
		});
		await notification.save();

		const result = await Course.findByIdAndUpdate(id, {title: title, key: key, description: description});
		res.status(200).json({message: "Course was updated successfully"}); 
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

		checkCourseOwner(course.creator.toString(), req.userId);

		await student.courses.pull(courseId);
		await student.save();
		await course.students.pull(studentId);
		await course.save();

		const notification = new Notification({
			title: course.title,
			description: "removed",
			user: req.userId,
			type: "student",
			courseId: course._id
		});
		await notification.save();

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
	const courseId = req.body.courseId;

	let students = [];
	let group = '';

	if (fullName !== '' || login !== '' || groupVal !== '') {
		let group = await Group.findOne({name: groupVal});

		students = await Student.find().populate('group')
			.and([
		      { 'fullName': {$regex: fullName , $options: "i"} },
		      { 'login': {$regex: login, $options: "i"} },
		      { 'courses': { $ne: courseId } },
		      group ? { 'group': group._id } : {}
		    ]);
	}
	res.status(200).json(students);
}

exports.addStudents = async (req, res, next) => {
	try {
		const course = await Course.findById(req.body.courseId);

		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}

		const students = req.body.students;

		checkCourseOwner(course.creator.toString(), req.userId);
		
		if (students.length !== []) {
			students.forEach(async (s) => {
				course.students.push(s);
				await Student.findByIdAndUpdate(s._id, { $push: { courses: course } });
			});
		}

		await course.save();

		const notification = new Notification({
			title: course.title,
			description: "added",
			user: req.userId,
			type: "students",
			courseId: course._id
		});
		await notification.save();

		res.status(201).json({message: "Students added successfully"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
	

}

exports.deleteStudents = async (req, res, next) => {
	try {
		const courseId = req.body.courseId;

		const course = await Course.findById(courseId);
		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}
		
		checkCourseOwner(course.creator.toString(), req.userId);

		course.students.forEach(async (studentId) => {
			const student = await Student.findById(studentId);

			await student.courses.pull(courseId);
			await student.save();
		});

		course.students = [];
		await course.save();

		const notification = new Notification({
			title: course.title,
			description: "removed all",
			user: req.userId,
			type: "students",
			courseId: course._id
		});
		await notification.save();
		res.status(200).json({message: "Students deleted"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.deleteCourse = async (req, res, next) => {
	try {
		const course = await Course.findById(req.body.id);

		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}

		checkCourseOwner(course.creator.toString(), req.userId);

		course.students.forEach(async (studentId) => {
			const student = await Student.findById(studentId);

			await student.courses.pull(course._id);
			await student.save();
		});
		await Course.deleteOne({ _id: course._id });

		const notification = new Notification({
			title: course.title,
			description: "deleted",
			user: req.userId,
			type: "course"
		});
		await notification.save();
		res.status(200).json({message: "Course deleted"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.getFeed = async (req, res, next) => {
	const courseId = req.body.courseId;
	let assignments = await Assignment.find({course: courseId});

	// let sortedAss = [];

	// let parentAssignmnents = assignments.filter(ass => !ass.parent);

	let posts = await Post.find({course: courseId});
	let articles = await Article.find({course: courseId});
	let testworks = await Testwork.find({course: courseId});

	let combinedAr = assignments.concat(posts);
	combinedAr = combinedAr.concat(testworks);
	combinedAr = combinedAr.concat(articles);

	combinedAr.sort(function(a, b){
	  	return new Date(a.createdAt) - new Date(b.createdAt);
	});

	// for ([index, assignment] of combinedAr.entries()) {
	// 	let marginLeft = assignment.marginLeft || 0;
	// 	marginLeft += 20;
	// 	for ([index2, ass] of assignments.entries()) {
			
	// 		if (ass.parent && ass.parent.toString() === assignment._id.toString()) {
				
	// 			let assCopy = JSON.parse(JSON.stringify(ass));
	// 			console.log(assCopy);
	// 			assCopy.marginLeft = marginLeft;
	// 			combinedAr.splice(index+1, 0, assCopy);
	// 		}
			
	// 	}

	// }

	res.status(200).json(combinedAr);
}

exports.getStudentGrades = async (req, res, next) => { 
	try {
		const courseId = req.body.id;

		const assignments = await Assignment.find({course: courseId}).populate('topic');
		let result = [];

		for (const assignment of assignments) {
			if (assignment.hidden === true || assignment.topic.hidden === true) {
			} else {
				const solution = await Solution.findOne({assignment: assignment._id, student: req.userId});
				result.push({id: assignment._id, title: assignment.title, createdAt: assignment.createdAt, deadline: assignment.deadline, maxGrade: assignment.maxGrade, grade: solution ? solution.grade : null, comment: solution ? solution.comment : null});	

			}
		}

		console.log(result);
		res.status(200).json(result);
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.registerStudent = async (req, res, next) => { 
	try {
		const courseId = req.body.courseId;
		await Course.updateOne({_id: courseId}, {$push: {students: req.userId}});
		
		const notification = new Notification({
			title: course.title,
			description: "registered",
			user: req.userId,
			type: "course",
			courseId: course._id
		});
		await notification.save();
		res.status(201).json({message: "User added"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.sendRequest = async (req, res, next) => { 
	try {
		const courseId = req.body.courseId;
		await Course.updateOne({_id: courseId}, {$push: {requests: req.userId}});
		res.status(201).json({message: "User request added"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.acceptStudent = async (req, res, next) => {
	try {
		const courseId = req.body.courseId;
		const studentId = req.body.studentId;

		const course = await Course.findById(courseId);
		checkCourseOwner(course.creator.toString(), req.userId);

		await Course.updateOne({_id: courseId}, { $push: { students: studentId } });
		await Course.updateOne({_id: courseId}, { $pull: { requests: studentId } });

		const notification = new Notification({
			title: course.title,
			description: "accepted",
			user: req.userId,
			type: "student",
			courseId: course._id
		});
		await notification.save();

		res.status(201).json({message: "Student accepted"});

	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.acceptAllStudents = async (req, res, next) => {
	try {
		const courseId = req.body.courseId;
		const course = await Course.findById(courseId);
		const requests = course.requests;

		checkCourseOwner(course.creator.toString(), req.userId);

		await Course.updateOne({_id: courseId}, {$push: {students: requests}})
		await Course.updateOne({_id: courseId}, {$set: {requests: []}})
		
		const notification = new Notification({
			title: course.title,
			description: "accepted",
			user: req.userId,
			type: "students",
			courseId: course._id
		});
		await notification.save();

		res.status(201).json({message: "All students accepted"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}
