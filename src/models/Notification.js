const mongoose = require('mongoose');

const Notification = mongoose.model('notification', new mongoose.Schema({
 
    timeStamp: {
        type: Date,
        default: new Date()
    },

    text: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    sent: {
        type: Boolean,
        default: false
    },

    sentTimeStamp: {
        type: Date,
        required: false
    }


}));


exports.Notification = Notification; 