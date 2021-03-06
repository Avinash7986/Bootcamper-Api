const express = require('express');
const router = express.Router();

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  uploadPhoto,
} = require('../controllers/bootcampController');

const Bootcamp = require('../models/Bootcamp');

const advancedResults = require('../middleware/advancedResults');

const { protect, authorize } = require('../middleware/auth');

// Include Otherr Resource Routers
const courseRouter = require('../routes/courseRoute');
const reviewRouter = require('../routes/reviewRoute');

// Re-Route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
  .route('/')
  .get(
    advancedResults(Bootcamp, { path: 'courses', select: 'title' }),
    getBootcamps
  )
  .post(protect, createBootcamp);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), uploadPhoto);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
