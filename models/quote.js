const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Define userId as a string
    username: { type: String, required: true },
    quote: { type: String, required: true },
  }, { timestamps: true });

// Define a model for the quote schema
const Quote = mongoose.model('Quote', quoteSchema);

// Export the Quote model
module.exports = Quote;
