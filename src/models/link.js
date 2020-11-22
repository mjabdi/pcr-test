const mongoose = require('mongoose');

const Link = mongoose.model('Link', new mongoose.Schema({
  
    timeStamp: {
        type: Date,
        default: Date()
    },

    seqNo: {
        type: Number,
        required: true,
    },

    status: {
        type: String,
        required: true,
        default: 'new'
    },
    
    rawLink : {
        type: String,
        required: true,
        unique : true,
        minlength: 1,
        maxlength: 250
    },

    filename: {
        type: String,
        required: false,
    },

    isPCR: {
        type: Boolean,
        default: false
    },

    surname: {
        type: String,
        required: false,
    },

    forename: {
        type: String,
        required: false,
    },

    birthDate:{
        type: String,
        required: false
    },

    testDate:{
        type: String,
        required: false
    },

    result: {
        type: String,
        required: false,
    },

    emailNotFound: {
        type: Boolean,
        required: false
    },

    seen : {
        type: Boolean,
        default: false
    },

    extRef: {
        type: String,
        required: false
    }

}));


exports.Link = Link; 