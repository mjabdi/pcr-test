const mongoose = require('mongoose');

const GlobalParams = mongoose.model('global', new mongoose.Schema({
 
    name : {
        type: String,
        required: true,
        unique: true
    },

    lastExtRef: {
        type: Number,
        required: true
    },

    value: {
        type: String,
        required: false
    }


}));


exports.GlobalParams = GlobalParams; 