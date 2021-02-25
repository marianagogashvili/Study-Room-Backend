const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	maxGrade: {
		type: Number,
		required: true
	},
	fileUrl: [{
			type: String,
			required: true
	}],
	description: {
		type: String,
		required: true
	},
	topic: {
		type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
	},
	course: {
		type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
	},
	availableFrom: {
		type: Date,
		default: new Date(),
		required: true
	},
	deadline: {
		type: Date,
		required: false
	},
	children: [{
		type: Schema.Types.ObjectId,
		ref: 'Assignment'
	}]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);