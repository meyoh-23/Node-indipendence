const nodemailer = require('nodemailer');

const sendEmail = async (emailOptions)=> {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    const options = {
        from: 'Felix Meyoh <meyoh-developer@yahoo.com>',
        to: emailOptions.email,
        subject: emailOptions.subject,
        text: emailOptions.message
    };
    await transporter.sendMail(options);
};

module.exports = sendEmail;