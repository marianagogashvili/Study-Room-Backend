const Solution =  require('../models/solution');
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

	const assignmentId = req.body.assignmentId;
	const studentId = req.body.studentId;
	const remove = JSON.parse(req.body.remove);

	remove.forEach(file => {
		fs.unlinkSync(file);
	});

	const solution = await Solution.findOne({assignment: assignmentId, student: studentId});

	let files = [...solution.fileUrl];

	remove.forEach(r => {
		files = files.filter(file => file !== r);
	});

	req.files.forEach(file => {
		files.push(file.path);
	});

	solution.fileUrl = files;
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

exports.deleteSolution = async (req, res, next) => {
	const assignmentId = req.body.assignmentId;
	const studentId = req.body.studentId;

	const solution = await Solution.findOne({assignment: assignmentId, student: studentId});

	solution.fileUrl.forEach(file => fs.unlinkSync(file));
	await Solution.deleteOne({_id: solution._id});

	res.status(201).json({message: "Solution deleted"});
	
}
