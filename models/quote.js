const mongoose = require('mongoose');

// Define the quote schema
const quoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        maxlength: 100
    }
}, { timestamps: true });

// Define a model for the quote schema
const Quote = mongoose.model('Quote', quoteSchema);

// Export the Quote model
module.exports = Quote;
