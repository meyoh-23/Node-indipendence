const express = require('express');

const authController = require('../controller/auth-controller');

const router = express.Router();

// authentication & authorization routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/activate-account/:activationToken', authController.activateAccount);
router.post('/forgot-password', authController.forgetPassword);
router.patch('/reset-password/:resetToken',authController.resetPassword);

module.exports = router;