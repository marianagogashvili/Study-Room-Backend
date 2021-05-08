const { validationResult } = require('express-validator');
const Testwork = require("../models/testwork");
const TestAnswer = require("../models/testAnswer");
const Notification = require("../models/notification");

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
		const answersList = JSON.parse(req.body.answers);

		const testAnswers = new TestAnswer({
			testwork: testId,
			student: req.userId
		});
		await testAnswers.save();

		await TestAnswer.updateOne({_id: testAnswers._id}, { $push: { answers: answersList } });
		
		const answers = await TestAnswer.findOne({_id: testAnswers._id});
		let finalGrade = 0;

		if (answers) {
			testwork.questions.forEach( question => {

	  			let answ = answers.answers.filter(a => a.question.toString() === question._id.toString());

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

	  			} else if (!question.autoCheck && !question.answer) {
	  				if (answ[0].answers) {
		  				let pointPerOne = question.points / Object.keys(question.answers).length;

		  				let points = 0;
		  				for ([val, a] of Object.entries(question.answers)) {

		  					if (question.answers[val] === answ[0].answers[val]) {
		  						points += pointPerOne;
		  					} else {
		  						points -= pointPerOne;
		  					}
		  				}
		  				if (points < 0) {
		  					points = 0;
		  				}

		  				answ[0].grade = Math.round(points * 10) / 10;
	  				} else {
	  					answ[0].grade = 0;
	  				}
	  			}
	  			// console.log(answ[0].grade);

	  			finalGrade += answ[0].grade ? answ[0].grade : 0;

	  		});		
	  		await answers.save();	
		}

		await TestAnswer.updateOne({_id: testAnswers._id}, { grade: finalGrade });
		
		console.log(finalGrade);

		const notification = new Notification({
			title: testwork.title,
			description: "You've completed test",
			user: req.userId,
			type: "testanswer",
			linkId: testwork._id,
			courseId: testwork.course
		});
		await notification.save();

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
				console.log(question);
				console.log(answers.answers);

	  			let answ = answers.answers.filter(a => a.question.toString() === question._id.toString());
				console.log(answ);
	  			result.push({question: question, studentAnswer: answ[0].answer || answ[0].answers || null, points: answ[0].grade});
	  		});		
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

exports.getAnswersForTeacher = async (req, res, next) => {
	try {
		const testId = req.body.testId;
		
		const answers = await TestAnswer.find({testwork: testId});
		const testwork = await Testwork.findById(testId).populate({path: 'course', populate: {path: 'students', populate: {path: 'group'}}});
		const students = testwork.course.students;

		if ((testwork.course.creator.toString() !== req.userId)) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = "You are not allowed to do this";
			throw error;
		}	

		let result = [];

		for(student of students) {
			let studentsAnsw = answers.filter(a => a.student.toString() === student._id.toString());
			// console.log(studentsAnsw);

			let answersWithQuestions = [];
			let gradedQuestions = 0;

			let max = 0;
			testwork.questions.forEach( question => max += question.points );
			
			if (studentsAnsw.length > 0) {

				testwork.questions.forEach( question => {
  					let answ = studentsAnsw[0].answers.filter(a => a.question.toString() === question._id.toString());

		  			answersWithQuestions.push({question: question, studentAnswer: answ[0] ? answ[0].answer : null, studentAnswers: answ[0] ? answ[0].answers : null, points: answ[0] ? answ[0].grade : null });
		  		});	
				
				studentsAnsw[0].answers.forEach(answ => { gradedQuestions += (answ.grade || answ.grade === 0) ? 1 : 0 });

			}


			result.push({
				_id: student._id, 
				login: student.login, 
				fullName: student.fullName, 
				group: student.group.name, 
				answers: answersWithQuestions, 
				sumPoints: studentsAnsw[0] ? studentsAnsw[0].grade : null,
				gradedQuestions: gradedQuestions ,
				max: max,
				createdAt: studentsAnsw.length > 0 ? studentsAnsw[0].createdAt : null });
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

exports.updateAnswers = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = "You haven't provided answers";
			throw error;
		}
		const testId = req.body.testId;
		const student = req.body.student;
		const answers = JSON.parse(req.body.answers);
		console.log(answers);

		let finalGrade = 0;
		answers.forEach(val => finalGrade += val.grade);

		const testwork = await Testwork.findById(testId).populate({ path: 'course', populate: {path: 'creator'} });
		
		if ((testwork.course.creator._id.toString() !== req.userId)) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = "You are not allowed to do this";
			throw error;
		}	

		await TestAnswer.updateOne({testwork: testId, student: student}, {$set: {answers: answers, grade: finalGrade}});

		const answer = await TestAnswer.findOne({testwork: testId, student: student});

		const notification = new Notification({
			title: testwork.title,
			description: "Your test has been graded by " + testwork.course.creator.fullName,
			user: student,
			type: "testanswer",
			linkId: testwork._id,
			courseId: testwork.course
		});
		await notification.save();

		res.status(200).json(answer);
	}  catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

