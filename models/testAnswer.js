const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testAnswerSchema = new Schema({
	student: {
		type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
	},
	testwork: {
		type: Schema.Types.ObjectId,
        ref: 'Testwork',
        required: true
	},
	answers: [
		{
			question: {
				type: Schema.Types.ObjectId,
		        ref: 'Question',
		        required: true
			},
			grade: {
				type: Number
			},
			answer: {
				type: String,
				required: false
			}
		}
	]
}, { timestamps: true });

module.exports = mongoose.model('TestAnswer', testAnswerSchema);