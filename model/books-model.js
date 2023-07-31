mongoose = require('mongoose');

bookSchema = mongoose.Schema({
    bookTitle: {
        type: String,
        required: [true, 'Provide the Title of the Book You are reviewing']
    },
    author: {
        type: String,
        required: [true, 'Provide the author of the book you are reviewing']
    },
    edition: String,
    content: {
        type: String,
        required: [true, 'You need to provide a brief Summary of the book, It will give an insight to the pential readers that interract with your posts']
    },
    numberOfPages: Number,
    numberOfSections: Number,
    numberOfChapters: Number,
    genre: String,
    rating: Number,
    reviewedBy: {
        type: String,
        required:[ true, 'You have to provide the name of the reviewer.']
    }
});

const Books = mongoose.model('Books', bookSchema);
module.exports = Books;