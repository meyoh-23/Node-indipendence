const crypto = require('crypto');
const bcrypt = require('bcrypt');
jwt = require('jsonwebtoken');

const User = require('./../model/user-model');
const catchAsync = require('./../utils/catch-async');
const AppError = require('./../utils/app-error');
const sendEmail = require('./../utils/send-mail');

// returns a signed jws token
const authToken = id => {
    return jwt.sign(
        {id},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
        );
};

//signup function
exports.signup = catchAsync(async (req, res, next) => {
    const password = await req.body.password;
    const passwordConfirm = await req.body.passwordConfirm;
        // check if the passwords are matching
        if (!(password === passwordConfirm)) {
            return next(new AppError(` your passwords are not matching, please check again and submit`, 401))
        }

        // generate activation token and send to client
    const activatingToken = crypto.randomBytes(8).toString('hex')
    const HashedactivationToken = crypto.createHash('sha256').update(activatingToken).digest('hex');
    const activationURL = `${req.protocol}://${req.get('host')}/api/v1/users/activate-account/${activatingToken}`;
    const message = `Use the link ${activationURL} to activate your account`; // activation link

    const newUser = await User.create(
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        }
    );
     // the two properties to be removed once the account has been activated
    newUser.ActivationToken = HashedactivationToken;
    newUser.ActivatingTokenExpiresIn = Date.now() + 15 * 60 * 1000;
    await newUser.save( {validateBeforeSave: false} );
    // send activation link to the client
    try {
        await sendEmail({
            email: newUser.email,
            subject: `ACCOUNT ACTIVATION LINK: Valid only for 15 minutes`,
            message
        });
    } catch (error) {
        newUser = undefined;
        console.log(error, error.stack);
        return next(new AppError('We could not create your account at this time. Try again Later', 500));
    }
    res.status(201).json({
        status: 'success',
        message: 'activation Link send to your email'
    });
});

// activate account
exports.activateAccount = catchAsync(async(req, res, next) => {
    const activateToken = crypto
    .createHash('sha256')
    .update(req.params.activationToken)
    .digest('hex');

    const activeUser = await User.findOne(
        {ActivationToken: activateToken,
        ActivatingTokenExpiresIn: {$gt:Date.now()}
        }
    );
    if (!activeUser) {
        return next(new AppError('Your activation token is invalid or has expires, Try activating by reseting your Password', 404));
    }
    activeUser.ActivationToken = undefined;
    activeUser.ActivatingTokenExpiresIn = undefined;
    await activeUser.save({validateBeforeSave: false});
    //generate token to log the user in
    const token = authToken(activeUser._id);
    // save the user in the database and log the user in ----later when implementing JWT.
    res.status(200).json({
        status: 'success',
        message: 'Your account has been activated Successfully',
        token,
        user: {
            activeUser
        }
    });
});

// login
exports.login = catchAsync(async (req, res, next) => {
    // search by username or  email
    const {email, password} = req.body;
    if ((!email & !password)) {
        return next( new AppError('you must provide your Username/ email and password to login'));
    }
    const user = await User.findOne({email}).select('+password');
    // match passwords
    if (!user ||! await bcrypt.compare(password, user.password)) {
        return next(new AppError(' either your email or password is incorrect', 403));
    }
    // generate token for the user when the password is successfully confirmed.
    const token = authToken(user._id);
    user.password = undefined; // to not show password at the output
    res.status(200).json({
        status: 'success',
        message: 'logged in successfully',
        token,
        data: {
            user
        }
    });
});

// forgot password prompt- function
exports.forgetPassword =catchAsync(async (req, res, next) => {
    // seach by email
    const {email} = req.body;
    if (!email) {
        return next(new AppError('You must provide your email to recover your account', 400));
    }
    const user = await User.findOne({email});
    if (!user) {
        return next(new AppError('No account with such email in the System, Signup instead.', 404));
    }

    // generating the reset token
    const passwordResetToken = crypto.randomBytes(8).toString('hex');
    // stored in the db for reseting porposes
    const hashedResetToken = crypto
    .createHash('sha256')
    .update(passwordResetToken)
    .digest('hex');

    user.ActivationToken = hashedResetToken;
    user.ActivatingTokenExpiresIn = Date.now() + 10 * 60 * 1000;
    user.save({validateBeforeSave: false});
     //generate reset url and send message to email to client
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${passwordResetToken}`;
    const message = `Use the link to reset password/activate your account ${resetURL}\n If you did not request to reset password/activate your account, please ignore the link.`
    // SEND EMAIL
    try {
        await sendEmail({
            email: user.email,
            subject: `PASSWORD RESET LINK/ACCOUNT ACTIVATION LINK. the link is only valid for the next ten minutes`,
            message
        })
    } catch (error) {
        user.ActivationToken = undefined;
        user.ActivatingTokenExpiresIn = undefined;
        console.log(error);
        return next(new AppError('There was an error sending the reset toekn to you email. Please try again later.', 500));
    }
    //send response
    res.status(200).json({
        status: 'success',
        message: 'reset has been sent to your email'
    })
});

// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
    const {password, passwordConfirm} = req.body;
    if (!password && passwordConfirm) {
        return next(new AppError('You need to provide your  new password and  new password confirmation to reset\nYour Password and Password Confirmation Should match and should be at least 8 characters long'));
    };
    // hash the setet token and use it to look up the database
    const activateToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    userToReset = await User.findOne(
        {ActivationToken: activateToken,
        ActivatingTokenExpiresIn: {$gt:Date.now()}
    });
    if (!userToReset) {
        return next(new AppError('Either your password reset/ activation Link is invalid or has expired. Please try the process again', 401));
    }
    // reseting password and paswordConfirm
    userToReset.password = req.body.password;
    userToReset.passwordConfirm = req.body.passwordConfirm;
    // clearing the reset toekn and expiration form the database
    userToReset.ActivationToken = undefined;
    userToReset.ActivatingTokenExpiresIn = undefined;
    // mark the time when the password was reset
    userToReset.PasswordResetOn = Date.now() - 1000;
    userToReset.save();

    // generate jwt to log the client in after reseting the password
    const token = authToken(userToReset._id);
    res.status(200).json({
        status: 'success',
        Message: 'Account Password has ben reset successfully',
        token,
        user: {
            userToReset
        }
    });
});