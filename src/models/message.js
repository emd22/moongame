var mongodb = require('mongodb');
var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    message: String,
    sender: String
});

var Message = mongoose.model('Message', messageSchema);

module.exports = {
    messageSchema,
    Message
};