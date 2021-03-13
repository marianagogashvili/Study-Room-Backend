const Solution =  require('../models/solution');
const Student =  require('../models/student');
const Assignment =  require('../models/assignment');
const Course =  require('../models/course');
const Notification =  require('../models/notification');

const Mongoose = require('mongoose');

const fs = require('fs');

exports.createSolution = async (req, res, next) => {
	try {
		const assignmentId = req.body.assignmentId;

		const assignment = await Assignment.findById(assignmentId).populate('course');
		if (!assignment.course.students.includes(req.userId)) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = "Sorry, you are not a member of this course";
			throw error;
		}

		let files = [];
		req.files.forEach(file => {
			files.push(file.path);
		});

		let solution = new Solution({
			assignment: assignmentId,
			student: req.userId,
			fileUrl: files
		});
		await solution.save();

		const notification = new Notification({
			title: assignment.title,
			description: "added",
			user: req.userId,
			type: "solution",
			courseId: assignment.course
		});
		await notification.save();

		res.status(201).json(solution);
	}  catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.updateSolutionStudent = async (req, res, next) => {
	try {
		const solutionId = req.body.solutionId;
		const remove = JSON.parse(req.body.remove);

		const solution = await Solution.findById(solutionId).populate('assignment');

		if (solution.student.toString() !== req.userId) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = "Sorry, you are not a member of this course";
			throw error;
		}
		
		if (!solution) {
			const error = new Error();
			error.data = "Solution does not exist";
			error.status = 403;
			throw error;
		}

		if (!solution.grade) {
			remove.forEach(file => {
				fs.unlinkSync(file);
			});

			let files = [...solution.fileUrl];

			remove.forEach(r => {
				files = files.filter(file => file !== r);
			});

			req.files.forEach(file => {
				files.push(file.path);
			});

			solution.fileUrl = files;
			await solution.save();
		} else {
			const error = new Error();
			error.data = "Sorry, but you can't edit graded solution";
			error.status = 403;
			throw error;
		}

		const notification = new Notification({
			title: solution.assignment.title,
			description: "updated",
			user: req.userId,
			type: "solution",
			courseId: solution.assignment.course
		});
		await notification.save();

		res.status(201).json(solution);
	}  catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}

}


exports.updateSolutionTeacher= async (req, res, next) => {
	try {
		const solutionId = req.body.solutionId;
		const grade = req.body.grade;
		const comment = req.body.comment;

		const solution = await Solution.findById(solutionId).populate({path: 'assignment', populate: {path: 'course'}});

		if (solution.assignment.course.creator.toString() !== req.userId) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = "Sorry, you are not a member of this course";
			throw error;
		}

		solution.grade = grade;
		solution.comment = comment;
		await solution.save();

		const notification = new Notification({
			title: solution.assignment.title,
			description: "graded",
			user: req.userId,
			type: "solution",
			courseId: solution.assignment.course
		});
		await notification.save();

		res.status(201).json(solution);
	} catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.getSolutionStudent = async (req, res, next) => {
	const assignmentId = req.body.assignmentId;   

	const solution = await Solution.findOne({assignment: assignmentId, student: req.userId});
	if (!solution) {
		res.status(200).json(null);
	} else {
		res.status(200).json(solution);
	}
	
}

exports.getSolutionsTeacher = async (req, res, next) => {
	const assignmentId = req.body.id;
	const assignment = await Assignment.findOne({_id: assignmentId}).populate({path: 'course', populate: {path: 'students', populate: { path: 'group' }}});
	
	const students  = [...assignment.course.students];
	const solutions = await Solution.find({assignment: assignmentId});

	res.status(200).json({students, solutions});
}

exports.deleteSolution = async (req, res, next) => {
	try {
		const solutionId = req.body.solutionId;

		const solution = await Solution.findById(solutionId).populate('assignment');

		if (solution.student.toString() !== req.userId) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = "Sorry, you are not a member of this course";
			throw error;
		}

		solution.fileUrl.forEach(file => fs.unlinkSync(file));
		await Solution.deleteOne({_id: solutionId});

		const notification = new Notification({
			title: solution.assignment.title,
			description: "deleted",
			user: req.userId,
			type: "solution",
			courseId: solution.assignment.course
		});
		await notification.save();

		res.status(201).json({message: "Solution deleted"});
	} catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
	
	
}
