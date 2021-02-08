const Solution =  require('../models/solution');
const Student =  require('../models/student');
const Assignment =  require('../models/assignment');
const Course =  require('../models/course');

const Mongoose = require('mongoose');

const fs = require('fs');

exports.createSolution = async (req, res, next) => {
	const assignmentId = req.body.assignmentId;
	const studentId = req.body.studentId;

	let files = [];
	req.files.forEach(file => {
		files.push(file.path);
	});

	let solution = new Solution({
		assignment: assignmentId,
		student: studentId,
		fileUrl: files
	});
	await solution.save();
	res.status(201).json(solution);
}

exports.updateSolutionStudent = async (req, res, next) => {
	try {
		const assignmentId = req.body.assignmentId;
		const studentId = req.body.studentId;
		const remove = JSON.parse(req.body.remove);

		const solution = await Solution.findOne({assignment: assignmentId, student: studentId});
		
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

		res.status(201).json(solution);
	}  catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}

}


exports.updateSolutionTeacher= async (req, res, next) => {
	const assignmentId = req.body.assignmentId;
	const studentId = req.body.studentId;
	const grade = req.body.grade;
	const comment = req.body.comment;

	const solution = await Solution.findOne({assignment: assignmentId, student: studentId});

	solution.grade = grade;
	solution.comment = comment;
	await solution.save();

	res.status(201).json(solution);
}

exports.getSolutionStudent = async (req, res, next) => {
	const assignmentId = req.body.assignmentId;
	const studentId = req.body.studentId;      

	const solution = await Solution.findOne({assignment: assignmentId, student: studentId});
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
	const assignmentId = req.body.assignmentId;
	const studentId = req.body.studentId;

	const solution = await Solution.findOne({assignment: assignmentId, student: studentId});

	solution.fileUrl.forEach(file => fs.unlinkSync(file));
	await Solution.deleteOne({_id: solution._id});

	res.status(201).json({message: "Solution deleted"});
	
}
