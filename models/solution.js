const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const solutionSchema = new Schema({
	fileUrl: [
		{
			type: String,
			required: true
		}
	],
	grade: {
		type: Number
	},
	comment: {
		type: String
	},
	assignment: {
		type: Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
	},
	student: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
	}
}, { timestamps: true });

module.exports = mongoose.model('Solution', solutionSchema);