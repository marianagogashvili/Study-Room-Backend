const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testworkSchema = new Schema({
	course: {
		type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
	},
	title: {
		type: String,
		required: true
	},
	deadline: {
		type: Date
	},
	timeRestriction: {
		type: Number
	},
	questions: [
		{
			question: {
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
			answer: {
				type: String,
				required: true
			}
		}
	]
});

module.exports = mongoose.model('Testwork', testworkSchema);