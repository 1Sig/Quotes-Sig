const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema
const userSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
      unique: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  });

// Hash the password before saving the user
userSchema.pre('save', async function(next) {
  try {
      const hashedPassword = await bcrypt.hash(this.password, 10); // No explicit salt
      this.password = hashedPassword;
      next();
  } catch (error) {
      next(error);
  }
});

// Define a method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
      return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
      throw new Error(error);
  }
};

// Define a model for the user schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;