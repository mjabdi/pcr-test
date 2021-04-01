const mongoose = require('mongoose');

const BloodReport = mongoose.model('bloodreport', new mongoose.Schema({
  
    timeStamp: {
        type: Date,
        default: Date()
    },

    status: {
        type: String,
        required: true,
        default: 'new'
    },
    
    rawLink : {
        type: String,
        required: false,
    },

    source: {
        type: String,
        required: true
    },

    filename: {
        type: String,
        required: false,
    },

    name: {
        type: String,
        required: false,
    },

    birthDate:{
        type: String,
        required: false
    },

    email:{
        type: String,
        required: false
    },

    testDate:{
        type: String,
        required: false
    },

    emailNotFound: {
        type: Boolean,
        required: false
    },

    seen: {
        type: Boolean,
        default: false
    },

    extRef: {
        type: String,
        required: false
    },

    dontSendEmail: {
        type: Boolean,
        required: false
    },

    bookingId: {
        type: mongoose.Types.ObjectId,
        required: false
    },

    clinic: {
        type: String,
        required: false
    },

    emailSent: {
        type: Boolean,
        default: false
    }

}));


exports.BloodReport = BloodReport; 