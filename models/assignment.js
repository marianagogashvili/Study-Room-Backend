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
	hidden: {
		type: Boolean,
		required: true,
		default: false
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
	parent: {
		type: Schema.Types.ObjectId,
        ref: 'Assignment',
        required: false
	}
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);