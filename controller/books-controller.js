const AppError = require('../utils/app-error');
const Books = require('./../model/books-model');
const catchAsync = require('./../utils/catch-async');

// create a new review
exports.createReview = catchAsync(async (req, res, next) => {
    const newReview =await Books.create(
    {
        bookTitle,
        author,
        edition,
        numberOfPages,
        numberOfSections,
        numberOfChapters,
        genre,
        reviewedBy,
        rating,
        content} = req.body
);
    if (!newReview) {
        return next(new AppError('Your have not typed in your post yet', 400))
    }
    // send response to the client
    res.status(201).json({
        status: 'success',
        message: 'Your review has been posted successfully',
        reviews: {
            newReview
        }
    });
});

// find all reviews - more advanced features to be implemented later
exports.findAllReviews = catchAsync(async (req, res, next) => {
const reviews = await Books.find();

res.status(200).json({
    status: 'success',
    total: reviews.length,
    data: {
        reviews
    }
})
});

// edit a riview
exports.editReview = catchAsync(async (req, res, next) => {
    console.log(req.params.id)
    const review = await Books.findOneAndUpdate({_id: req.params.id}, req.body,
        {
            new: true,
            runValidators: true
        }
    );
        console.log(review);
    if (!review){
        return next(new AppError('The review does not exist', 401));
    }

    res.status(200).json({
            status: 'success',
            message: 'review updated Successfully',
            data:{
                review
            }
    }
    )
});

// delete a review
exports.deleteReview = catchAsync(async (req, res, next) => {
    console.log(req.params.id);
const review = await Books.findOneAndDelete( req.params.id);
if (!review || review === null) {
    return next( new AppError('the review you want to delete doest not exist', 400));
}

res.status(204).json({
    status: 'success',
    message: 'The review has been deleted successfully'
    });
});

// get a single review
exports.findAreview = catchAsync(async(req, res, next) => {
    const review = await Books.findById(req.params.id);
    console.log(review)
    if (!review) {
        return next(new AppError('review with that Id does not exist. Please check your Id again and submit'));
    }

    // sending response
    res.status(200).json({
        status: 'success',
        message: 'the review was obtained Successfully',
        BookReview: {
            review
        }
    })
});