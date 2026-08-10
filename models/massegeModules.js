const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    content: {
        type: String,
        required: true
    }
},
    {timestamps: true}
);
module.exports = mongoose.model('Message', messageSchema);