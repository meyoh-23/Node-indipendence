const express = require('express');
const morgan = require('morgan');

const authRouter = require('./routers/users-router');
booksRouter = require('./routers/books-router');
const globalErrorHandling = require('./controller/errorController');


const app = express();
app.use(morgan('dev'));
app.use(express.json())

//routings - testing users
app.use('/api/v1/users', authRouter);
app.use('/api/v1/books', booksRouter);

app.use(globalErrorHandling);
module.exports = app;