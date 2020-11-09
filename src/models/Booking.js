const mongoose = require('mongoose');

const Booking = mongoose.model('Booking', new mongoose.Schema({
  
    timeStamp: {
        type: Date,
        default: new Date()
    },

    forename: {
        type: String,
        required: true
    },    

    surname: {
        type: String,
        required: true
    },   

    gender: {
        type: String,
        required: true
    },   

    title: {
        type: String,
        required: true
    },   

    email: {
        type: String,
        required: true
    },   

    birthDate: {
        type: String,
        required: true
    },   

    phone: {
        type: String,
        required: true
    },   

    address: {
        type: String,
        required: true
    },   

    postCode: {
        type: String,
        required: true
    },   

    notes: {
        type: String,
        required: false,
    },

    certificate: {
        type: Boolean,
        default: false
    },

    passportNumber: {
        type: String,
        required: false,
    },

    passportNumber2: {
        type: String,
        required: false,
    },
    
    bookingDate: {
        type: String,
        required: true,
    },

    bookingTime: {
        type: String,
        required: true,
    },

    bookingRef: {
        type: String,
        required: true,
    },

    paid: {
        type: Boolean,
        default: false
    },

    forenameCapital: {
        type: String,
        required: false
    },

    surnameCapital: {
        type: String,
        required: false
    },
    
    bookingTimeNormalized : {
        type: String,
        required: false
    },

    status: {
        type: String,
        required: false,
        default: 'booked'
    }

}));


exports.Booking = Booking; 