const express = require('express');

const booksController = require('./../controller/books-controller');

const router = express.Router();


router.route('/',)
.post(booksController.createReview)
.get(booksController.findAllReviews);

router.route('/:id')
.patch(booksController.editReview)
.delete(booksController.deleteReview)
.get(booksController.findAreview);



module.exports = router;
