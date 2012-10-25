
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.ObjectId;

// Define the schema
var tripSchema = new Schema({
	creator: { type: Schema.Types.ObjectId, ref: 'User' },
	where: { type: String },
	area: { type: String },
	when: Date,
	type: String,
	intensity: String,
	duration: String,
	description: String,
	comments: [{ 
		comment: String, 
		when: { type: Date, default: Date.now } 
	}],
	participants: [ { type: Schema.Types.ObjectId, ref: 'User' } ]
});

// Define the model
var Trip = mongoose.model('Trip', tripSchema);

// Export the model
module.exports = Trip;