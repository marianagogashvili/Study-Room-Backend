const { validationResult } = require('express-validator');
const Testwork = require("../models/testwork");
const TestAnswer = require("../models/testAnswer");

exports.saveAnswers = async (req, res, next) => {
	try {
		const testId = req.body.testId;
		const testwork = await Testwork.findById(testId).populate('course');

		if (!testwork.course.students.includes(req.userId)) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = 'You are not a member of this course';
			throw error;
		}
		const answers = JSON.parse(req.body.answers);

		const testAnswers = new TestAnswer({
			testwork: testId,
			student: req.userId
		});
		await testAnswers.save();
		
		await TestAnswer.updateOne({_id: testAnswers._id}, { $push: { answers: answers } });

		res.status(201).json(testAnswers);
	}  catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.getAnswers = async (req, res, next) => {
	try {
		const testId = req.body.testId;
		const testwork = await Testwork.findById(testId).populate('course');
		const answers = await TestAnswer.findOne({testwork: testId, student: req.userId});

		if ((testwork.course.creator.toString() !== req.userId) &&
			(!testwork.course.students.includes(req.userId))) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = "You are not allowed to do this";
			throw error;
		}	

		let result = [];
		if (answers) {
			testwork.questions.forEach( question => {
	  			let answ = answers.answers.filter(a => a.question.toString() === question._id.toString());
	
	  			if (answ[0].grade === undefined) {

		  			if (question.answer === 'a' || question.answer === 'b'||
		  				question.answer === 'c' || question.answer === 'd') {

		  				if (answ[0].answer && answ[0].answer === question.answer) {
		  					answ[0].grade = question.points;
		  				} else {
		  					answ[0].grade = 0;
		  				}

		  			} else if (question.autoCheck === true) {

		  				if (answ[0].answer && answ[0].answer.toLowerCase().trim() === 
		  					question.answer.toLowerCase().trim()) {
							answ[0].grade = question.points;
		  				} else {
		  					answ[0].grade = 0;
		  				}

		  			}
	  			} 

	  			result.push({question: question, studentAnswer: answ[0].answer, points: answ[0].grade});
	  		});		
	  		await answers.save();	
		}

		res.status(200).json(result);
	}  catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};