const AppError = require("./../utils/app-error");

const handleCastErrorDB = error => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 404);
}

const handleDuplicateFieldsDB = error => {
    const value = error.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
    const message = `Duplicate field Values: ${value} Pease use another value`;
    return new AppError(message, 400); // bad request
}

const handleValidationErrorDB = error => {
    const errors = Object.values(error.errors).map(el => el.message)

    const message = `Invalid Input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token, Please login again', 401)

const handleJWTExpiredError= () => new AppError('Your session is expired, Please login again', 401)

// DEVELOPMENT ERRORS - while the app is being built
// get all the info that will help to solve for the error
const sendDevErrors = (error, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        error: error,
        stack: error.stack
        });
}
// PRODUCTION ERRORS- one application has been deployed
const sendProdErrors = (error, res) => {
    // checking for operational error, trusted by the developer: details should not be leaked to the client
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            })
    } else {
        // kinda unknown errors and are not trused by the developer
        console.log('ERROR 🔥🔥🔥🔥🔥', error);
        res.status(500).json({
            status: 'error',
            message: 'something Went very Wrong!'
        });
    }
}

// global express error handling midddleware
// it is an error firts middleware, and takes in four arguments 
module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if( process.env.NODE_ENV === 'development') {
        sendDevErrors(error, res)

    } else if ( process.env.NODE_ENV === 'production') {
        let error = { ...error } //destructuring the err, to avoid overwriting the original err variable//18 Handling Invalid Database IDs

        if (error.name === 'CastError'){
            error = handleCastErrorDB(error);
        }
        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error)
        }
        if (error.name == 'ValidationError') {
            error = handleValidationErrorDB(error)
        }
        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        if (error.name === 'TokenExpiredError') {
            handleJWTExpiredError();
        }
        sendProdErrors(error, res);
    }
}