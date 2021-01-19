const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = Schema({
	name: {
		type: String,
		required: true
	}
});
 
module.exports = mongoose.model('Group', groupSchema);