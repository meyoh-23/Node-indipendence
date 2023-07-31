const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// handling uncought Exeptions -should be placed at the very top
process.on('uncaughtException', error=>{
    console.log('UNCOUGHT EXEPTIONS! 🔥🔥🔥🔥🔥, shutting down ...');
    console.log(error.name, error.message);
    console.log(error.stack);
    process.exit(1);
});

const app = require('./app');
const port = process.env.PORT;

//connect to database
conectDb = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECT, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('DB connection is successful')
    } catch (error) {
        console.log(error)
    }
}

// initializing server
const server = app.listen(port, () =>{
    console.log(`App is Listening on Port ${port}`);
    conectDb();
});

// Use event listner or event emmiters to listen to unhandled rejection
process.on('unhandledRejection', error =>{
    console.log('UNHANDLED REJECTIONS 🔥🔥🔥🔥🔥, Shutting down...');
    console.log(error.name, error.message, error.stack);
    server.close(() =>{
    process.exit(1);
    });
  });