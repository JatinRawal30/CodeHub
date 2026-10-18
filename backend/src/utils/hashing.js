const bcrypt = require("bcrypt");

async function hashPassword(password) {
    const saltRounds = 10; // Number of salt rounds for hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

async function comparePasswords(plainPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);  // isMatch will be true if the passwords match, false otherwise
    return isMatch;
}

module.exports = {
    hashPassword,
    comparePasswords,
};