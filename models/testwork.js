const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testworkSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	hidden: {
		type: Boolean,
		required: true
	},
	deadline: {
		type: Date
	},
	timeRestriction: {
		type: Number
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
	questions: [
		{
			title: {
				type: String,
				required: true
			},
			a: {
				type: String
			},
			b: {
				type: String
			},
			c: {
				type: String
			},
			d: {
				type: String
			},
			autoCheck: {
				type: Boolean
			},
			points: {
				type: Number,
				required: true
			},
			answer: {
				type: String,
				required: true
			}
		}
	]
});

module.exports = mongoose.model('Testwork', testworkSchema);