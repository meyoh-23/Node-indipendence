const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'You Must Provide your First Name']
    },
    lastName: {
        type: String,
        required: [true, 'You Must Provide Your Last Name']
    },
    userName: {
        type: String,
        required: [true, 'You must Provide your userName'],
        unique: [true, 'this used name is alreaddy taken, Please choose another username']
    },
    email: {
        type: String,
        required: true,
        validate:[ validator.isEmail, 'You must Provide a valid email'],
        unique: [true, 'this email already exists in our database, log in to your account instead']
    },
    password: {
        type: String,
        minlength: [8, 'your Password Should be at Least 8 charachters long'],
        required: [true, 'You need to set a password for your account'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Pease Confirm your Password'],
    },
    ActivationToken: String,
    ActivatingTokenExpiresIn: Date,
    PasswordResetOn: Date
});

userSchema.pre('save', async function(next){
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 8);
    this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(
        candidatePassword,
        userPassword
        )
}

const User = mongoose.model('User', userSchema);
module.exports = User;