const mongoose = require('mongoose');

const STDBookingSchema = new mongoose.Schema({
  
    timeStamp: {
        type: Date,
        default: new Date()
    },

    fullname: {
        type: String,
        required: true
    },    

    email: {
        type: String,
        required: false
    },   

    phone: {
        type: String,
        required: false
    },  

    packageName: {
        type: String,
        required: true
    }, 
    
    notes: {
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

    paidBy: {
        type: String,
        required: false
    },

    corporate: {
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
    },

    deleted: {
        type: Boolean,
        required: true,
        default: false
    },

    referrer: {
        type: String,
        required: false,
    },

    deposit: {
        type: Number,
        default: 0
    },

    OTCCharges: {
        type: Number,
        default: 0
    },

    estimatedPrice: {
        type: String,
        default: ''
    },

    paymentInfo: {
        type: String,
        required: false
    },

    refund: {
        type: String,
        required: false
    },

    formData: {
        type: String,
        required: false
    }

});

module.exports = {
        STDBooking : mongoose.model('STDBooking', STDBookingSchema)
} 