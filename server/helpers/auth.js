const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);      // Generate salt
    const hashed = await bcrypt.hash(password, salt);   // Hash password with salt
    return hashed;
  } catch (err) {
    console.error('Error generating salt or hashing password:', err);
    throw err;
  }
};

const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch; // true if match, false otherwise
  } catch (err) {
    console.error('Error comparing passwords:', err);
    throw err;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
};
